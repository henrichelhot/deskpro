// Real Email Service for production email server connections
import { supabase } from '../lib/supabase'

interface EmailConnection {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  provider: 'gmail' | 'outlook' | 'imap' | 'pop3' | 'exchange'
}

interface EmailMessage {
  id: string
  from: string
  to: string
  subject: string
  body: string
  date: Date
  messageId: string
  inReplyTo?: string
  references?: string[]
  headers?: { [key: string]: string }
  attachments?: EmailAttachment[]
}

interface EmailAttachment {
  filename: string
  contentType: string
  size: number
  content: Buffer | string
}

export class RealEmailService {
  // Gmail API integration using OAuth2
  static async fetchGmailEmails(connection: EmailConnection): Promise<EmailMessage[]> {
    try {
      console.log('🔌 Connecting to Gmail API...')
      
      // In production, you would use Gmail API with OAuth2
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages', {
        headers: {
          'Authorization': `Bearer ${connection.auth.pass}`, // OAuth2 token
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      const emails: EmailMessage[] = []
      
      // Fetch each message details
      for (const message of data.messages || []) {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
            headers: {
              'Authorization': `Bearer ${connection.auth.pass}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (messageResponse.ok) {
          const messageData = await messageResponse.json()
          const email = this.parseGmailMessage(messageData)
          emails.push(email)
        }
      }
      
      console.log(`📧 Retrieved ${emails.length} emails from Gmail`)
      return emails
      
    } catch (error) {
      console.error('Gmail API error:', error)
      throw new Error(`Failed to fetch Gmail emails: ${error}`)
    }
  }

  // Microsoft Graph API for Outlook/Exchange
  static async fetchOutlookEmails(connection: EmailConnection): Promise<EmailMessage[]> {
    try {
      console.log('🔌 Connecting to Microsoft Graph API...')
      
      const response = await fetch('https://graph.microsoft.com/v1.0/me/messages', {
        headers: {
          'Authorization': `Bearer ${connection.auth.pass}`, // OAuth2 token
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Microsoft Graph API error: ${response.statusText}`)
      }
      
      const data = await response.json()
      const emails: EmailMessage[] = []
      
      for (const message of data.value || []) {
        const email = this.parseOutlookMessage(message)
        emails.push(email)
      }
      
      console.log(`📧 Retrieved ${emails.length} emails from Outlook`)
      return emails
      
    } catch (error) {
      console.error('Microsoft Graph API error:', error)
      throw new Error(`Failed to fetch Outlook emails: ${error}`)
    }
  }

  // IMAP connection for generic email providers
  static async fetchIMAPEmails(connection: EmailConnection): Promise<EmailMessage[]> {
    try {
      console.log(`🔌 Connecting to IMAP server ${connection.host}:${connection.port}...`)
      
      // For real IMAP connections, you would use a library like node-imap
      // Since we're in WebContainer, we'll use a WebSocket-based IMAP proxy
      
      const imapConfig = {
        host: connection.host,
        port: connection.port,
        secure: connection.secure,
        auth: connection.auth
      }
      
      // Connect via WebSocket to IMAP proxy service
      const ws = new WebSocket(`wss://imap-proxy.your-domain.com/connect`)
      
      return new Promise((resolve, reject) => {
        const emails: EmailMessage[] = []
        
        ws.onopen = () => {
          console.log('📡 WebSocket IMAP connection established')
          ws.send(JSON.stringify({
            type: 'connect',
            config: imapConfig
          }))
        }
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'connected':
              console.log('✅ IMAP authentication successful')
              ws.send(JSON.stringify({
                type: 'fetch',
                folder: 'INBOX',
                limit: 50
              }))
              break
              
            case 'emails':
              console.log(`📧 Received ${data.emails.length} emails from IMAP`)
              emails.push(...data.emails.map(this.parseIMAPMessage))
              ws.close()
              resolve(emails)
              break
              
            case 'error':
              console.error('❌ IMAP error:', data.error)
              reject(new Error(data.error))
              break
          }
        }
        
        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
          reject(new Error('IMAP connection failed'))
        }
        
        // Timeout after 30 seconds
        setTimeout(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.close()
            reject(new Error('IMAP connection timeout'))
          }
        }, 30000)
      })
      
    } catch (error) {
      console.error('IMAP connection error:', error)
      throw new Error(`Failed to connect to IMAP server: ${error}`)
    }
  }

  // POP3 connection
  static async fetchPOP3Emails(connection: EmailConnection): Promise<EmailMessage[]> {
    try {
      console.log(`🔌 Connecting to POP3 server ${connection.host}:${connection.port}...`)
      
      // Similar to IMAP but using POP3 protocol
      const ws = new WebSocket(`wss://pop3-proxy.your-domain.com/connect`)
      
      return new Promise((resolve, reject) => {
        const emails: EmailMessage[] = []
        
        ws.onopen = () => {
          ws.send(JSON.stringify({
            type: 'connect',
            config: {
              host: connection.host,
              port: connection.port,
              secure: connection.secure,
              auth: connection.auth
            }
          }))
        }
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'connected':
              ws.send(JSON.stringify({ type: 'list' }))
              break
              
            case 'emails':
              emails.push(...data.emails.map(this.parsePOP3Message))
              ws.close()
              resolve(emails)
              break
              
            case 'error':
              reject(new Error(data.error))
              break
          }
        }
        
        ws.onerror = () => reject(new Error('POP3 connection failed'))
        setTimeout(() => ws.close(), 30000)
      })
      
    } catch (error) {
      throw new Error(`Failed to connect to POP3 server: ${error}`)
    }
  }

  // Exchange Web Services (EWS)
  static async fetchExchangeEmails(connection: EmailConnection): Promise<EmailMessage[]> {
    try {
      console.log(`🔌 Connecting to Exchange server ${connection.host}...`)
      
      // Exchange Web Services SOAP API
      const soapEnvelope = `
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
                       xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
          <soap:Header>
            <t:RequestServerVersion Version="Exchange2013" />
          </soap:Header>
          <soap:Body>
            <FindItem xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"
                      Traversal="Shallow">
              <ItemShape>
                <t:BaseShape>AllProperties</t:BaseShape>
              </ItemShape>
              <ParentFolderIds>
                <t:DistinguishedFolderId Id="inbox" />
              </ParentFolderIds>
            </FindItem>
          </soap:Body>
        </soap:Envelope>
      `
      
      const response = await fetch(`https://${connection.host}/EWS/Exchange.asmx`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'http://schemas.microsoft.com/exchange/services/2006/messages/FindItem',
          'Authorization': `Basic ${btoa(`${connection.auth.user}:${connection.auth.pass}`)}`
        },
        body: soapEnvelope
      })
      
      if (!response.ok) {
        throw new Error(`Exchange error: ${response.statusText}`)
      }
      
      const xmlText = await response.text()
      const emails = this.parseExchangeResponse(xmlText)
      
      console.log(`📧 Retrieved ${emails.length} emails from Exchange`)
      return emails
      
    } catch (error) {
      throw new Error(`Failed to connect to Exchange server: ${error}`)
    }
  }

  // Main fetch function that routes to appropriate provider
  static async fetchEmailsFromProvider(connection: EmailConnection): Promise<EmailMessage[]> {
    console.log(`📧 Fetching emails from ${connection.provider} provider...`)
    
    switch (connection.provider) {
      case 'gmail':
        return this.fetchGmailEmails(connection)
      case 'outlook':
        return this.fetchOutlookEmails(connection)
      case 'imap':
        return this.fetchIMAPEmails(connection)
      case 'pop3':
        return this.fetchPOP3Emails(connection)
      case 'exchange':
        return this.fetchExchangeEmails(connection)
      default:
        throw new Error(`Unsupported email provider: ${connection.provider}`)
    }
  }

  // Test email connection
  static async testConnection(connection: EmailConnection): Promise<{
    success: boolean
    message: string
    details?: any
  }> {
    try {
      console.log(`🔍 Testing connection to ${connection.provider}...`)
      
      switch (connection.provider) {
        case 'gmail':
          // Test Gmail API access
          const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
            headers: {
              'Authorization': `Bearer ${connection.auth.pass}`
            }
          })
          
          if (!gmailResponse.ok) {
            throw new Error('Gmail API authentication failed')
          }
          
          return {
            success: true,
            message: 'Gmail connection successful',
            details: await gmailResponse.json()
          }
          
        case 'outlook':
          // Test Microsoft Graph API access
          const outlookResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
              'Authorization': `Bearer ${connection.auth.pass}`
            }
          })
          
          if (!outlookResponse.ok) {
            throw new Error('Microsoft Graph API authentication failed')
          }
          
          return {
            success: true,
            message: 'Outlook connection successful',
            details: await outlookResponse.json()
          }
          
        case 'imap':
        case 'pop3':
          // Test IMAP/POP3 connection via WebSocket proxy
          return new Promise((resolve, reject) => {
            const ws = new WebSocket(`wss://${connection.provider}-proxy.your-domain.com/test`)
            
            ws.onopen = () => {
              ws.send(JSON.stringify({
                type: 'test',
                config: {
                  host: connection.host,
                  port: connection.port,
                  secure: connection.secure,
                  auth: connection.auth
                }
              }))
            }
            
            ws.onmessage = (event) => {
              const data = JSON.parse(event.data)
              ws.close()
              
              if (data.success) {
                resolve({
                  success: true,
                  message: `${connection.provider.toUpperCase()} connection successful`,
                  details: data.details
                })
              } else {
                reject(new Error(data.error))
              }
            }
            
            ws.onerror = () => {
              reject(new Error(`${connection.provider.toUpperCase()} connection failed`))
            }
            
            setTimeout(() => {
              ws.close()
              reject(new Error('Connection test timeout'))
            }, 10000)
          })
          
        case 'exchange':
          // Test Exchange Web Services
          const ewsResponse = await fetch(`https://${connection.host}/EWS/Exchange.asmx`, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/xml; charset=utf-8',
              'Authorization': `Basic ${btoa(`${connection.auth.user}:${connection.auth.pass}`)}`
            },
            body: '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetFolder xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"><FolderShape><t:BaseShape xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">Default</t:BaseShape></FolderShape><FolderIds><t:DistinguishedFolderId xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types" Id="inbox" /></FolderIds></GetFolder></soap:Body></soap:Envelope>'
          })
          
          if (!ewsResponse.ok) {
            throw new Error('Exchange authentication failed')
          }
          
          return {
            success: true,
            message: 'Exchange connection successful',
            details: {
              server: connection.host,
              authenticated: true
            }
          }
          
        default:
          throw new Error(`Unsupported provider: ${connection.provider}`)
      }
      
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  // Message parsing functions
  private static parseGmailMessage(messageData: any): EmailMessage {
    const headers = messageData.payload.headers
    const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || ''
    
    return {
      id: messageData.id,
      messageId: getHeader('Message-ID'),
      from: getHeader('From'),
      to: getHeader('To'),
      subject: getHeader('Subject'),
      date: new Date(getHeader('Date')),
      body: this.extractGmailBody(messageData.payload),
      headers: headers.reduce((acc: any, h: any) => {
        acc[h.name] = h.value
        return acc
      }, {}),
      inReplyTo: getHeader('In-Reply-To'),
      references: getHeader('References')?.split(' ').filter(Boolean)
    }
  }

  private static parseOutlookMessage(messageData: any): EmailMessage {
    return {
      id: messageData.id,
      messageId: messageData.internetMessageId,
      from: messageData.from?.emailAddress?.address || '',
      to: messageData.toRecipients?.[0]?.emailAddress?.address || '',
      subject: messageData.subject || '',
      date: new Date(messageData.receivedDateTime),
      body: messageData.body?.content || '',
      headers: messageData.internetMessageHeaders?.reduce((acc: any, h: any) => {
        acc[h.name] = h.value
        return acc
      }, {}) || {}
    }
  }

  private static parseIMAPMessage(messageData: any): EmailMessage {
    return {
      id: messageData.uid,
      messageId: messageData.messageId,
      from: messageData.from?.[0]?.address || '',
      to: messageData.to?.[0]?.address || '',
      subject: messageData.subject || '',
      date: new Date(messageData.date),
      body: messageData.text || messageData.html || '',
      headers: messageData.headers || {}
    }
  }

  private static parsePOP3Message(messageData: any): EmailMessage {
    return {
      id: messageData.id,
      messageId: messageData.messageId,
      from: messageData.from,
      to: messageData.to,
      subject: messageData.subject,
      date: new Date(messageData.date),
      body: messageData.body,
      headers: messageData.headers || {}
    }
  }

  private static parseExchangeResponse(xmlText: string): EmailMessage[] {
    // Parse Exchange SOAP response
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')
    const items = doc.querySelectorAll('t\\:Message, Message')
    
    return Array.from(items).map(item => ({
      id: item.querySelector('t\\:ItemId, ItemId')?.getAttribute('Id') || '',
      messageId: item.querySelector('t\\:InternetMessageId, InternetMessageId')?.textContent || '',
      from: item.querySelector('t\\:From t\\:EmailAddress t\\:EmailAddress, From EmailAddress EmailAddress')?.textContent || '',
      to: item.querySelector('t\\:ToRecipients t\\:Mailbox t\\:EmailAddress, ToRecipients Mailbox EmailAddress')?.textContent || '',
      subject: item.querySelector('t\\:Subject, Subject')?.textContent || '',
      date: new Date(item.querySelector('t\\:DateTimeReceived, DateTimeReceived')?.textContent || ''),
      body: item.querySelector('t\\:Body, Body')?.textContent || '',
      headers: {}
    }))
  }

  private static extractGmailBody(payload: any): string {
    if (payload.body?.data) {
      return atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'))
    }
    
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'))
        }
      }
    }
    
    return ''
  }
}