import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  Psychology as SemanticIcon,
  Timeline as EpisodicIcon,
  Settings as ProceduralIcon,
  Memory as MemoryIcon,
  Schedule as TimeIcon,
  Tag as TagIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import type { MemorySystem, Concept, EpisodicEvent, ProceduralSkill, Experience } from '../../types/memory';

interface MemorySearchToolProps {
  memorySystem?: MemorySystem;
  onSearch?: (query: string, filters: SearchFilters) => void;
  onResultSelect?: (result: SearchResult) => void;
}

interface SearchFilters {
  memoryTypes: string[];
  timeRange: [number, number];
  minStrength: number;
  categories: string[];
  tags: string[];
  locations: string[];
  participants: string[];
}

interface SearchResult {
  id: string;
  type: 'concept' | 'event' | 'skill' | 'experience';
  title: string;
  description: string;
  memoryType: 'semantic' | 'episodic' | 'procedural';
  strength: number;
  timestamp: number;
  category: string;
  tags: string[];
  location?: string;
  participants?: string[];
  relevanceScore: number;
  data: any;
}

const MemorySearchTool: React.FC<MemorySearchToolProps> = ({
  memorySystem,
  onSearch,
  onResultSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    memoryTypes: ['semantic', 'episodic', 'procedural'],
    timeRange: [Date.now() - 7 * 24 * 60 * 60 * 1000, Date.now()], // Last 7 days
    minStrength: 0.1,
    categories: [],
    tags: [],
    locations: [],
    participants: [],
  });
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'timestamp' | 'strength'>('relevance');
  const [showFilters, setShowFilters] = useState(false);

  // Get available categories from memory data
  const { availableCategories } = useMemo(() => {
    if (!memorySystem) {
      return {
        availableCategories: [] as string[],
      };
    }

    const categories = new Set<string>();

    // Extract from semantic memory
    if (memorySystem.semantic?.concepts) {
      memorySystem.semantic.concepts.forEach((concept: Concept) => {
        categories.add((concept as any).type || 'general');
      });
    }

    // Extract from episodic memory
    if (memorySystem.episodic?.events) {
      memorySystem.episodic.events.forEach((event: EpisodicEvent) => {
        categories.add((event as any).category || 'general');
      });
    }

    // Extract from procedural memory
    if (memorySystem.procedural?.skills) {
      memorySystem.procedural.skills.forEach((skill: ProceduralSkill) => {
        categories.add((skill as any).type || 'general');
      });
    }

    return {
      availableCategories: Array.from(categories),
    };
  }, [memorySystem]);

  // Perform search
  const performSearch = useCallback(async () => {
    if (!searchQuery.trim() || !memorySystem) return;

    setIsSearching(true);
    const results: SearchResult[] = [];

    // Search semantic memory
    if (filters.memoryTypes.includes('semantic') && memorySystem.semantic?.concepts) {
      memorySystem.semantic.concepts.forEach((concept: Concept) => {
        if (matchesFilters(concept, filters) && matchesQuery(concept, searchQuery)) {
          results.push({
            id: concept.id,
            type: 'concept',
            title: concept.name,
            description: (concept as any).description || '',
            memoryType: 'semantic',
            strength: concept.strength,
            timestamp: concept.lastAccessed,
            category: (concept as any).type || 'general',
            tags: (concept as any).tags || [],
            relevanceScore: calculateRelevance(concept, searchQuery),
            data: concept,
          });
        }
      });
    }

    // Search episodic memory
    if (filters.memoryTypes.includes('episodic') && memorySystem.episodic?.events) {
      memorySystem.episodic.events.forEach((event: EpisodicEvent) => {
        if (matchesFilters(event, filters) && matchesQuery(event, searchQuery)) {
          results.push({
            id: event.id,
            type: 'event',
            title: event.title,
            description: event.description,
            memoryType: 'episodic',
            strength: event.significance,
            timestamp: event.startTime,
            category: (event as any).category || 'general',
            tags: (event as any).tags || [],
            location: `${event.location.x}, ${event.location.y}`,
            participants: event.participants,
            relevanceScore: calculateRelevance(event, searchQuery),
            data: event,
          });
        }
      });

      // Search experiences
      if (memorySystem.episodic?.experiences) {
        memorySystem.episodic.experiences.forEach((experience: Experience) => {
          if (matchesFilters(experience, filters) && matchesQuery(experience, searchQuery)) {
            results.push({
              id: experience.id,
              type: 'experience',
              title: `Experience: ${experience.eventId}`,
              description: experience.lessons.join(', '),
              memoryType: 'episodic',
              strength: (experience as any).impact || 0.5,
              timestamp: experience.timestamp,
              category: 'experience',
              tags: [],
              relevanceScore: calculateRelevance(experience, searchQuery),
              data: experience,
            });
          }
        });
      }
    }

    // Search procedural memory
    if (filters.memoryTypes.includes('procedural') && memorySystem.procedural?.skills) {
      memorySystem.procedural.skills.forEach((skill: ProceduralSkill) => {
        if (matchesFilters(skill, filters) && matchesQuery(skill, searchQuery)) {
          results.push({
            id: skill.id,
            type: 'skill',
            title: skill.name,
            description: (skill as any).description || '',
            memoryType: 'procedural',
            strength: skill.proficiency.overall,
            timestamp: (skill as any).lastUsed || Date.now(),
            category: skill.type || 'general',
            tags: (skill as any).tags || [],
            relevanceScore: calculateRelevance(skill, searchQuery),
            data: skill,
          });
        }
      });
    }

    // Sort results
    const sortedResults = results.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevanceScore - a.relevanceScore;
        case 'timestamp':
          return b.timestamp - a.timestamp;
        case 'strength':
          return b.strength - a.strength;
        default:
          return 0;
      }
    });

    setSearchResults(sortedResults);
    setIsSearching(false);

    if (onSearch) {
      onSearch(searchQuery, filters);
    }
  }, [searchQuery, filters, memorySystem, sortBy, onSearch]);

  // Check if item matches search query
  const matchesQuery = useCallback((item: any, query: string): boolean => {
    const searchTerm = query.toLowerCase();
    const searchableText = [
      item.name || item.title || '',
      item.description || '',
      ...(item.tags || []),
      ...(item.participants || []),
    ].join(' ').toLowerCase();

    return searchableText.includes(searchTerm);
  }, []);

  // Check if item matches filters
  const matchesFilters = useCallback((item: any, filter: SearchFilters): boolean => {
    // Check time range
    if (item.timestamp && (item.timestamp < filter.timeRange[0] || item.timestamp > filter.timeRange[1])) {
      return false;
    }

    // Check strength
    const strength = item.strength || item.significance || item.proficiency?.overall || 0;
    if (strength < filter.minStrength) {
      return false;
    }

    // Check category
    if (filter.categories.length > 0 && !filter.categories.includes(item.category)) {
      return false;
    }

    // Check tags
    if (filter.tags.length > 0 && !filter.tags.some(tag => item.tags?.includes(tag))) {
      return false;
    }

    // Check location
    if (filter.locations.length > 0) {
      const itemLocation = item.location ? `${item.location.x}, ${item.location.y}` : '';
      if (!filter.locations.includes(itemLocation)) {
        return false;
      }
    }

    // Check participants
    if (filter.participants.length > 0 && !filter.participants.some(participant => item.participants?.includes(participant))) {
      return false;
    }

    return true;
  }, []);

  // Calculate relevance score
  const calculateRelevance = useCallback((item: any, query: string): number => {
    const searchTerm = query.toLowerCase();
    let score = 0;

    // Exact title match
    if (item.name?.toLowerCase() === searchTerm || item.title?.toLowerCase() === searchTerm) {
      score += 100;
    }

    // Title contains query
    if (item.name?.toLowerCase().includes(searchTerm) || item.title?.toLowerCase().includes(searchTerm)) {
      score += 50;
    }

    // Description contains query
    if (item.description?.toLowerCase().includes(searchTerm)) {
      score += 25;
    }

    // Tag matches
    if (item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))) {
      score += 30;
    }

    // Category match
    if (item.category?.toLowerCase().includes(searchTerm)) {
      score += 20;
    }

    return score;
  }, []);

  // Handle search on Enter key
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      performSearch();
    }
  }, [performSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  // Update filter
  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Get icon for memory type
  const getMemoryTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'semantic': return <SemanticIcon />;
      case 'episodic': return <EpisodicIcon />;
      case 'procedural': return <ProceduralIcon />;
      default: return <MemoryIcon />;
    }
  }, []);

  // Get color for memory type
  const getMemoryTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'semantic': return '#2196f3';
      case 'episodic': return '#4caf50';
      case 'procedural': return '#ff9800';
      default: return '#9c27b0';
    }
  }, []);

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Memory Search Tool
        </Typography>
        
        {/* Search Input */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: searchQuery && (
                <IconButton onClick={clearSearch} size="small">
                  <ClearIcon />
                </IconButton>
              ),
            }}
          />
          <Button
            variant="contained"
            onClick={performSearch}
            disabled={!searchQuery.trim() || isSearching}
            startIcon={<SearchIcon />}
          >
            Search
          </Button>
          <Tooltip title="Filters">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Search Filters
            </Typography>
            
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
              mb: 2
            }}>
              {/* Memory Types */}
              <FormControl fullWidth size="small">
                <InputLabel>Memory Types</InputLabel>
                <Select
                  multiple
                  value={filters.memoryTypes}
                  onChange={(e) => updateFilter('memoryTypes', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="semantic">
                    <Checkbox checked={filters.memoryTypes.includes('semantic')} />
                    Semantic
                  </MenuItem>
                  <MenuItem value="episodic">
                    <Checkbox checked={filters.memoryTypes.includes('episodic')} />
                    Episodic
                  </MenuItem>
                  <MenuItem value="procedural">
                    <Checkbox checked={filters.memoryTypes.includes('procedural')} />
                    Procedural
                  </MenuItem>
                </Select>
              </FormControl>

              {/* Categories */}
              <FormControl fullWidth size="small">
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={filters.categories}
                  onChange={(e) => updateFilter('categories', e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {availableCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      <Checkbox checked={filters.categories.includes(category)} />
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Sort By */}
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'timestamp' | 'strength')}
                >
                  <MenuItem value="relevance">Relevance</MenuItem>
                  <MenuItem value="timestamp">Timestamp</MenuItem>
                  <MenuItem value="strength">Strength</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2
            }}>
              {/* Strength Slider */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Min Strength: {(filters.minStrength * 100).toFixed(0)}%
                </Typography>
                <Slider
                  value={filters.minStrength}
                  onChange={(_, value) => updateFilter('minStrength', value)}
                  min={0}
                  max={1}
                  step={0.1}
                  marks={[
                    { value: 0, label: '0%' },
                    { value: 0.5, label: '50%' },
                    { value: 1, label: '100%' },
                  ]}
                />
              </Box>

              {/* Time Range */}
              <Box>
                <Typography variant="body2" gutterBottom>
                  Time Range: Last {Math.round((Date.now() - filters.timeRange[0]) / (24 * 60 * 60 * 1000))} days
                </Typography>
                <Slider
                  value={filters.timeRange[0]}
                  onChange={(_, value) => updateFilter('timeRange', [value as number, Date.now()])}
                  min={Date.now() - 30 * 24 * 60 * 60 * 1000}
                  max={Date.now()}
                  step={24 * 60 * 60 * 1000}
                  marks={[
                    { value: Date.now() - 7 * 24 * 60 * 60 * 1000, label: '7d' },
                    { value: Date.now() - 14 * 24 * 60 * 60 * 1000, label: '14d' },
                    { value: Date.now() - 30 * 24 * 60 * 60 * 1000, label: '30d' },
                  ]}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* Search Stats */}
        {searchResults.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Found {searchResults.length} results
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={`${searchResults.filter(r => r.memoryType === 'semantic').length} Semantic`} size="small" />
              <Chip label={`${searchResults.filter(r => r.memoryType === 'episodic').length} Episodic`} size="small" />
              <Chip label={`${searchResults.filter(r => r.memoryType === 'procedural').length} Procedural`} size="small" />
            </Box>
          </Box>
        )}
      </Paper>

      {/* Search Results */}
      <Paper sx={{ p: 2, maxHeight: '500px', overflow: 'auto' }}>
        {isSearching ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Searching memories...</Typography>
          </Box>
        ) : searchResults.length === 0 && searchQuery ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography color="text.secondary">No results found for "{searchQuery}"</Typography>
          </Box>
        ) : searchResults.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography color="text.secondary">Enter a search query to find memories</Typography>
          </Box>
        ) : (
          <List>
            {searchResults.map((result) => (
              <ListItem
                key={result.id}
                onClick={() => onResultSelect?.(result)}
                sx={{ mb: 1, border: '1px solid #e0e0e0', borderRadius: 1, cursor: 'pointer' }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: getMemoryTypeColor(result.memoryType) }}>
                    {getMemoryTypeIcon(result.memoryType)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">{result.title}</Typography>
                      <Chip label={result.type} size="small" variant="outlined" />
                      <Chip label={`${(result.relevanceScore * 100).toFixed(0)}% relevant`} size="small" />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {result.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={`${(result.strength * 100).toFixed(0)}% strength`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={new Date(result.timestamp).toLocaleDateString()} 
                          size="small" 
                          variant="outlined"
                          icon={<TimeIcon />}
                        />
                        {result.category && (
                          <Chip label={result.category} size="small" variant="outlined" />
                        )}
                        {result.location && (
                          <Chip label={result.location} size="small" variant="outlined" icon={<LocationIcon />} />
                        )}
                        {result.participants && result.participants.length > 0 && (
                          <Chip 
                            label={`${result.participants.length} participants`} 
                            size="small" 
                            variant="outlined"
                            icon={<PersonIcon />}
                          />
                        )}
                      </Box>
                      {result.tags.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                          {result.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" icon={<TagIcon />} />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default MemorySearchTool;