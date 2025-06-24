# Zendesk Clone Backend Architecture

## Tech Stack
- **Frontend**: React + TypeScript (Current)
- **Backend API**: Laravel 11
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime
- **Queue**: Laravel Queues (Redis)
- **Storage**: Laravel Storage (S3/Local)
- **Email**: Laravel Mail (SMTP/SES)

## Database Schema (Supabase)

### Core Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'agent', 'customer')) DEFAULT 'customer',
    avatar_url TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Organizations
CREATE TABLE organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tickets
CREATE TABLE tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT CHECK (status IN ('new', 'open', 'pending', 'on-hold', 'solved', 'closed')) DEFAULT 'new',
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    satisfaction TEXT CHECK (satisfaction IN ('offered', 'unoffered', 'good', 'bad')) DEFAULT 'unoffered',
    requester_id UUID REFERENCES public.users(id) NOT NULL,
    assignee_id UUID REFERENCES public.users(id),
    organization_id UUID REFERENCES organizations(id),
    due_date TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comments/Replies
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) NOT NULL,
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    attachments TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ticket Changes (Audit Log)
CREATE TABLE ticket_changes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.users(id) NOT NULL,
    field_name TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ticket Viewers (Who's viewing)
CREATE TABLE ticket_viewers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    last_viewed TIMESTAMPTZ DEFAULT now(),
    UNIQUE(ticket_id, user_id)
);

-- Attachments
CREATE TABLE attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_viewers ENABLE ROW LEVEL SECURITY;

-- Users can read their own data and agents can read all users
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'agent')));

-- Tickets visibility based on role
CREATE POLICY "Agents can see all tickets" ON tickets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'agent'))
    );

CREATE POLICY "Customers can see own tickets" ON tickets
    FOR ALL USING (
        requester_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'agent'))
    );

-- Comments follow ticket visibility
CREATE POLICY "Comments follow ticket visibility" ON comments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tickets t 
            WHERE t.id = ticket_id AND (
                t.requester_id = auth.uid() OR 
                EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'agent'))
            )
        )
    );
```

## Laravel API Structure

### Routes (api.php)
```php
<?php

use App\Http\Controllers\Api\{
    AuthController,
    TicketController,
    CommentController,
    UserController,
    AttachmentController
};

// Authentication
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    // User management
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/agents', [UserController::class, 'agents']);
    Route::patch('/users/{user}/assign', [UserController::class, 'assign']);
    
    // Tickets
    Route::apiResource('tickets', TicketController::class);
    Route::post('/tickets/{ticket}/assign', [TicketController::class, 'assign']);
    Route::post('/tickets/{ticket}/status', [TicketController::class, 'updateStatus']);
    Route::get('/tickets/{ticket}/viewers', [TicketController::class, 'viewers']);
    Route::post('/tickets/{ticket}/view', [TicketController::class, 'markAsViewed']);
    
    // Comments
    Route::post('/tickets/{ticket}/comments', [CommentController::class, 'store']);
    Route::get('/tickets/{ticket}/comments', [CommentController::class, 'index']);
    
    // Attachments
    Route::post('/attachments', [AttachmentController::class, 'store']);
    Route::get('/attachments/{attachment}', [AttachmentController::class, 'download']);
});
```

### Models

```php
<?php
// app/Models/Ticket.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    protected $fillable = [
        'ticket_number',
        'subject',
        'description',
        'status',
        'priority',
        'satisfaction',
        'requester_id',
        'assignee_id',
        'organization_id',
        'due_date',
        'tags',
        'custom_fields'
    ];

    protected $casts = [
        'tags' => 'array',
        'custom_fields' => 'array',
        'due_date' => 'datetime'
    ];

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function changes(): HasMany
    {
        return $this->hasMany(TicketChange::class);
    }

    public function viewers(): HasMany
    {
        return $this->hasMany(TicketViewer::class);
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($ticket) {
            $ticket->ticket_number = 'TKT-' . str_pad(
                Ticket::count() + 1, 
                6, 
                '0', 
                STR_PAD_LEFT
            );
        });
    }
}
```

### Controllers

```php
<?php
// app/Http/Controllers/Api/TicketController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Jobs\SendTicketNotification;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $query = Ticket::with(['requester', 'assignee'])
            ->when($request->status, fn($q) => $q->whereIn('status', $request->status))
            ->when($request->priority, fn($q) => $q->whereIn('priority', $request->priority))
            ->when($request->search, fn($q) => $q->where(function($query) use ($request) {
                $query->where('subject', 'ilike', "%{$request->search}%")
                      ->orWhere('ticket_number', 'ilike', "%{$request->search}%");
            }));

        return $query->paginate(25);
    }

    public function store(StoreTicketRequest $request)
    {
        $ticket = Ticket::create($request->validated());
        
        // Send notification
        SendTicketNotification::dispatch($ticket, 'created');
        
        return response()->json($ticket->load(['requester', 'assignee']), 201);
    }

    public function show(Ticket $ticket)
    {
        return $ticket->load(['requester', 'assignee', 'comments.author', 'changes.agent']);
    }

    public function update(UpdateTicketRequest $request, Ticket $ticket)
    {
        $oldValues = $ticket->only(['status', 'priority', 'assignee_id']);
        
        $ticket->update($request->validated());
        
        // Log changes
        foreach ($request->validated() as $field => $newValue) {
            if (isset($oldValues[$field]) && $oldValues[$field] != $newValue) {
                $ticket->changes()->create([
                    'agent_id' => auth()->id(),
                    'field_name' => $field,
                    'old_value' => $oldValues[$field],
                    'new_value' => $newValue,
                    'action' => "Changed {$field} from {$oldValues[$field]} to {$newValue}"
                ]);
            }
        }
        
        return $ticket->load(['requester', 'assignee']);
    }

    public function assign(Request $request, Ticket $ticket)
    {
        $request->validate(['assignee_id' => 'nullable|exists:users,id']);
        
        $oldAssignee = $ticket->assignee_id;
        $ticket->update(['assignee_id' => $request->assignee_id]);
        
        // Log assignment change
        $ticket->changes()->create([
            'agent_id' => auth()->id(),
            'field_name' => 'assignee_id',
            'old_value' => $oldAssignee,
            'new_value' => $request->assignee_id,
            'action' => $request->assignee_id 
                ? "Assigned to " . $ticket->assignee->name
                : "Unassigned ticket"
        ]);
        
        return response()->json(['message' => 'Ticket assigned successfully']);
    }

    public function markAsViewed(Ticket $ticket)
    {
        $ticket->viewers()->updateOrCreate(
            ['user_id' => auth()->id()],
            ['last_viewed' => now()]
        );
        
        return response()->json(['message' => 'Marked as viewed']);
    }

    public function viewers(Ticket $ticket)
    {
        $viewers = $ticket->viewers()
            ->with('user')
            ->where('last_viewed', '>=', now()->subMinutes(5))
            ->get();
            
        return response()->json($viewers);
    }
}
```

### Jobs for Background Processing

```php
<?php
// app/Jobs/SendTicketNotification.php

namespace App\Jobs;

use App\Models\Ticket;
use App\Mail\TicketCreated;
use App\Mail\TicketUpdated;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Mail;

class SendTicketNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Ticket $ticket,
        public string $action
    ) {}

    public function handle()
    {
        switch ($this->action) {
            case 'created':
                Mail::to($this->ticket->requester->email)
                    ->send(new TicketCreated($this->ticket));
                break;
                
            case 'updated':
                Mail::to($this->ticket->requester->email)
                    ->send(new TicketUpdated($this->ticket));
                break;
        }
    }
}
```

## Frontend Integration

### Supabase Client Setup
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Real-time subscriptions
export const subscribeToTicketChanges = (ticketId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`ticket-${ticketId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tickets',
      filter: `id=eq.${ticketId}`
    }, callback)
    .subscribe()
}
```

### API Service
```typescript
// services/api.ts
const API_BASE = import.meta.env.VITE_API_URL

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token')
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }

  // Tickets
  async getTickets(filters: any = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/tickets?${params}`)
  }

  async createTicket(data: any) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTicket(id: string, data: any) {
    return this.request(`/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async assignTicket(id: string, assigneeId: string) {
    return this.request(`/tickets/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignee_id: assigneeId }),
    })
  }

  // Comments
  async addComment(ticketId: string, data: any) {
    return this.request(`/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const api = new ApiService()
```

## Deployment Strategy

### Laravel API (Backend)
- **Hosting**: Laravel Forge + DigitalOcean/AWS
- **Database**: Supabase (managed PostgreSQL)
- **Queue**: Redis (for background jobs)
- **Storage**: S3 for file uploads
- **Email**: AWS SES or Mailgun

### Frontend
- **Hosting**: Vercel/Netlify
- **Environment Variables**: 
  - `VITE_API_URL` (Laravel API)
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Benefits of This Architecture

1. **Real-time Updates**: Supabase handles live data sync
2. **Scalable**: Laravel API can scale independently
3. **Secure**: RLS policies + Laravel authentication
4. **Fast Development**: Leverage both ecosystems
5. **Cost Effective**: Supabase free tier + affordable Laravel hosting
6. **Future Proof**: Can migrate to full Laravel or full Supabase later

## Next Steps

1. Set up Supabase project and database schema
2. Create Laravel API with authentication
3. Implement real-time subscriptions in frontend
4. Add file upload functionality
5. Set up email notifications
6. Deploy and test

This architecture gives you enterprise-level features while maintaining development speed and cost efficiency.