import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Help as HelpIcon,
  VolunteerActivism as OfferIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import type { AgentState } from '../../types/agent';

interface ConversationLogTabProps {
  agent: AgentState;
  agentId: string;
}

interface ConversationEntry {
  id: string;
  timestamp: number;
  message: string;
  sender: string;
  response: string;
  isRequestForHelp: boolean;
  isOfferOfAssistance: boolean;
}

const ConversationLogTab: React.FC<ConversationLogTabProps> = ({ agent }) => {
  const theme = useTheme();
  const { conversation, response } = agent;
  const [conversationHistory, setConversationHistory] = useState<ConversationEntry[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Add current conversation to history when it changes
  useEffect(() => {
    if (conversation && conversation.message) {
      const newEntry: ConversationEntry = {
        id: `${conversation.timestamp}-${conversation.sender}`,
        timestamp: conversation.timestamp || Date.now(),
        message: conversation.message,
        sender: conversation.sender,
        response: response || 'No response generated',
        isRequestForHelp: conversation.isRequestForHelp || false,
        isOfferOfAssistance: conversation.isOfferOfAssistance || false,
      };

      setConversationHistory(prev => {
        // Avoid duplicates
        const exists = prev.some(entry => entry.id === newEntry.id);
        if (!exists) {
          return [newEntry, ...prev].slice(0, 50); // Keep last 50 conversations
        }
        return prev;
      });
    }
  }, [conversation, response]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real implementation, this would send the message to the backend
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleClearHistory = () => {
    setConversationHistory([]);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getIntentChips = (entry: ConversationEntry) => {
    const chips = [];
    if (entry.isRequestForHelp) {
      chips.push(
        <Chip
          key="help-request"
          icon={<HelpIcon />}
          label="Help Request"
          size="small"
          color="error"
          variant="outlined"
          sx={{ mr: 1, mb: 1 }}
        />
      );
    }
    if (entry.isOfferOfAssistance) {
      chips.push(
        <Chip
          key="help-offer"
          icon={<OfferIcon />}
          label="Help Offer"
          size="small"
          color="success"
          variant="outlined"
          sx={{ mr: 1, mb: 1 }}
        />
      );
    }
    if (!entry.isRequestForHelp && !entry.isOfferOfAssistance) {
      chips.push(
        <Chip
          key="casual"
          icon={<ChatIcon />}
          label="Casual"
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mr: 1, mb: 1 }}
        />
      );
    }
    return chips;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Conversation Log - {agent.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Message history, intent analysis, and agent responses
      </Typography>

      <Grid container spacing={3}>
        {/* Current Conversation State */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ChatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Current Conversation
              </Typography>
              
              {conversation && conversation.message ? (
                <Box>
                  {/* Last Message */}
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: theme.palette.grey[50] }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="subtitle2">
                        From: {conversation.sender || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                        {formatTimestamp(conversation.timestamp || Date.now())}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {conversation.message}
                    </Typography>
                    <Box>
                      {getIntentChips(conversation as ConversationEntry)}
                    </Box>
                  </Paper>

                  {/* Generated Response */}
                  <Paper variant="outlined" sx={{ p: 2, backgroundColor: theme.palette.primary[50] }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ChatIcon sx={{ mr: 1, fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="subtitle2" color="primary">
                        {agent.name}'s Response:
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {response || 'No response generated yet'}
                    </Typography>
                  </Paper>
                </Box>
              ) : (
                <Alert severity="info">
                  No active conversation. The agent is not currently processing any messages.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Intent Analysis */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Intent Analysis
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Message Intent
                </Typography>
                {conversation ? (
                  <Box>
                    {conversation.isRequestForHelp && (
                      <Alert severity="error" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>Help Request Detected</strong>
                        </Typography>
                        <Typography variant="caption">
                          The sender is asking for assistance with a task.
                        </Typography>
                      </Alert>
                    )}
                    {conversation.isOfferOfAssistance && (
                      <Alert severity="success" sx={{ mb: 1 }}>
                        <Typography variant="body2">
                          <strong>Help Offer Detected</strong>
                        </Typography>
                        <Typography variant="caption">
                          The sender is offering to help with a task.
                        </Typography>
                      </Alert>
                    )}
                    {!conversation.isRequestForHelp && !conversation.isOfferOfAssistance && (
                      <Alert severity="info">
                        <Typography variant="body2">
                          <strong>Casual Conversation</strong>
                        </Typography>
                        <Typography variant="caption">
                          No specific intent detected - general communication.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No message to analyze
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Target Bot
                </Typography>
                <Typography variant="body1">
                  {conversation?.targetBot || 'Not specified'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Conversation History */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Conversation History ({conversationHistory.length})
                </Typography>
                {conversationHistory.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={handleClearHistory}
                    color="secondary"
                    title="Clear History"
                  >
                    <ClearIcon />
                  </IconButton>
                )}
              </Box>
              
              {conversationHistory.length > 0 ? (
                <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {conversationHistory.map((entry, index) => (
                    <React.Fragment key={entry.id}>
                      <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                      {/* Message */}
                      <Box sx={{ display: 'flex', mb: 1, width: '100%' }}>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Typography variant="subtitle2">
                                {entry.sender}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                {formatTimestamp(entry.timestamp)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                {entry.message}
                              </Typography>
                              {getIntentChips(entry)}
                            </Box>
                          }
                        />
                      </Box>
                      
                      {/* Response */}
                      <Box sx={{ display: 'flex', mb: 2, width: '100%', pl: 6 }}>
                        <ListItemIcon>
                          <ChatIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" color="primary">
                              {agent.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {entry.response}
                            </Typography>
                          }
                        />
                      </Box>
                    </ListItem>
                    {index < conversationHistory.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                No conversation history available. Messages will appear here as the agent communicates.
              </Alert>
            )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Message Input */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Send Quick Message
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Type a message to send to the agent..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  title="Send Message"
                >
                  <SendIcon />
                </IconButton>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                This will send a message to the agent for processing. The agent's response will appear in the conversation log.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConversationLogTab;