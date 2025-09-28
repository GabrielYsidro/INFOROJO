import React, { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface Destination {
  id: string;
  name: string;
  address: string;
  distance: string;
  estimatedTime: string;
  isSelected: boolean;
  category: 'commercial' | 'residential' | 'industrial' | 'tourist' | 'health' | 'education';
  busRoutes: string[];
}

interface FilterOption {
  id: string;
  label: string;
  isActive: boolean;
  count: number;
}

export default function MapaFiltrosScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([
    {
      id: '1',
      name: 'Centro Comercial Plaza Norte',
      address: 'Av. Principal 123, Zona Norte',
      distance: '2.5 km',
      estimatedTime: '15 min',
      isSelected: false,
      category: 'commercial',
      busRoutes: ['Ruta 15', 'Ruta 8', 'Ruta 25']
    },
    {
      id: '2',
      name: 'Hospital Central',
      address: 'Calle Salud 456, Centro',
      distance: '1.8 km',
      estimatedTime: '12 min',
      isSelected: false,
      category: 'health',
      busRoutes: ['Ruta 12', 'Ruta 3']
    },
    {
      id: '3',
      name: 'Universidad Nacional',
      address: 'Campus Universitario, Zona Este',
      distance: '4.2 km',
      estimatedTime: '25 min',
      isSelected: false,
      category: 'education',
      busRoutes: ['Ruta 20', 'Ruta 7']
    },
    {
      id: '4',
      name: 'Parque Central',
      address: 'Av. Recreación 789, Centro',
      distance: '3.1 km',
      estimatedTime: '18 min',
      isSelected: false,
      category: 'tourist',
      busRoutes: ['Ruta 5', 'Ruta 15']
    },
    {
      id: '5',
      name: 'Zona Industrial Sur',
      address: 'Polígono Industrial, Zona Sur',
      distance: '6.5 km',
      estimatedTime: '35 min',
      isSelected: false,
      category: 'industrial',
      busRoutes: ['Ruta 18', 'Ruta 22']
    },
    {
      id: '6',
      name: 'Residencial Los Pinos',
      address: 'Calle Residencial 321, Zona Oeste',
      distance: '5.2 km',
      estimatedTime: '28 min',
      isSelected: false,
      category: 'residential',
      busRoutes: ['Ruta 10', 'Ruta 14']
    }
  ]);

  const [filters, setFilters] = useState<FilterOption[]>([
    { id: 'commercial', label: 'Comercial', isActive: false, count: 1 },
    { id: 'health', label: 'Salud', isActive: false, count: 1 },
    { id: 'education', label: 'Educación', isActive: false, count: 1 },
    { id: 'tourist', label: 'Turismo', isActive: false, count: 1 },
    { id: 'industrial', label: 'Industrial', isActive: false, count: 1 },
    { id: 'residential', label: 'Residencial', isActive: false, count: 1 },
  ]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'commercial':
        return 'building.2.fill';
      case 'health':
        return 'cross.fill';
      case 'education':
        return 'graduationcap.fill';
      case 'tourist':
        return 'location.fill';
      case 'industrial':
        return 'building.fill';
      case 'residential':
        return 'house.fill';
      default:
        return 'location.fill';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'commercial':
        return '#4CAF50';
      case 'health':
        return '#F44336';
      case 'education':
        return '#2196F3';
      case 'tourist':
        return '#FF9800';
      case 'industrial':
        return '#9C27B0';
      case 'residential':
        return '#607D8B';
      default:
        return '#757575';
    }
  };

  const toggleFilter = (filterId: string) => {
    setFilters(prev => 
      prev.map(filter => 
        filter.id === filterId 
          ? { ...filter, isActive: !filter.isActive }
          : filter
      )
    );
  };

  const toggleDestination = (destinationId: string) => {
    setDestinations(prev => 
      prev.map(dest => 
        dest.id === destinationId 
          ? { ...dest, isSelected: !dest.isSelected }
          : dest
      )
    );
  };

  const clearAllFilters = () => {
    setFilters(prev => prev.map(filter => ({ ...filter, isActive: false })));
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const applyFilters = () => {
    const selectedDestinations = destinations.filter(d => d.isSelected);
    
    Alert.alert(
      'Filtros aplicados',
      `Se encontraron ${filteredDestinations.length} destinos con los filtros seleccionados.\n\nDestinos seleccionados: ${selectedDestinations.length}`,
      [{ text: 'OK' }]
    );
  };

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || destination.category === selectedCategory;
    const matchesActiveFilters = filters.every(filter => 
      !filter.isActive || destination.category === filter.id
    );
    
    return matchesSearch && matchesCategory && matchesActiveFilters;
  });

  const selectedCount = destinations.filter(d => d.isSelected).length;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Filtro por Destino</ThemedText>
        <ThemedText style={styles.subtitle}>
          Encuentra destinos y planifica tu viaje
        </ThemedText>
      </ThemedView>

      {/* Search Bar */}
      <ThemedView style={styles.searchContainer}>
        <ThemedView style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={20} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar destino..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9E9E9E"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={20} color="#757575" />
            </TouchableOpacity>
          )}
        </ThemedView>
      </ThemedView>

      {/* Category Filters */}
      <ThemedView style={styles.filtersContainer}>
        <ThemedView style={styles.filtersHeader}>
          <ThemedText type="subtitle">Categorías</ThemedText>
          <TouchableOpacity onPress={clearAllFilters}>
            <ThemedText style={styles.clearButton}>Limpiar</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                filter.isActive && styles.activeFilterChip
              ]}
              onPress={() => toggleFilter(filter.id)}
            >
              <ThemedText style={[
                styles.filterText,
                filter.isActive && styles.activeFilterText
              ]}>
                {filter.label} ({filter.count})
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      {/* Destinations List */}
      <ThemedView style={styles.destinationsContainer}>
        <ThemedView style={styles.destinationsHeader}>
          <ThemedText type="subtitle">
            Destinos ({filteredDestinations.length})
          </ThemedText>
          {selectedCount > 0 && (
            <ThemedText style={styles.selectedCount}>
              {selectedCount} seleccionados
            </ThemedText>
          )}
        </ThemedView>

        <ScrollView style={styles.destinationsList}>
          {filteredDestinations.map((destination) => (
            <TouchableOpacity
              key={destination.id}
              style={[
                styles.destinationCard,
                destination.isSelected && styles.selectedDestinationCard
              ]}
              onPress={() => toggleDestination(destination.id)}
            >
              <ThemedView style={styles.destinationHeader}>
                <ThemedView style={styles.destinationIcon}>
                  <IconSymbol 
                    name={getCategoryIcon(destination.category)} 
                    size={24} 
                    color={getCategoryColor(destination.category)} 
                  />
                </ThemedView>
                <ThemedView style={styles.destinationContent}>
                  <ThemedText 
                    type="subtitle" 
                    style={[
                      styles.destinationName,
                      destination.isSelected && styles.selectedText
                    ]}
                  >
                    {destination.name}
                  </ThemedText>
                  <ThemedText style={styles.destinationAddress}>
                    {destination.address}
                  </ThemedText>
                </ThemedView>
                {destination.isSelected && (
                  <ThemedView style={styles.selectedIcon}>
                    <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
                  </ThemedView>
                )}
              </ThemedView>

              <ThemedView style={styles.destinationMeta}>
                <ThemedView style={styles.metaItem}>
                  <IconSymbol name="arrow.up.right" size={16} color="#757575" />
                  <ThemedText style={styles.metaText}>
                    {destination.distance}
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.metaItem}>
                  <IconSymbol name="clock.fill" size={16} color="#757575" />
                  <ThemedText style={styles.metaText}>
                    {destination.estimatedTime}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.busRoutes}>
                <ThemedText style={styles.routesLabel}>Rutas disponibles:</ThemedText>
                <ThemedView style={styles.routesContainer}>
                  {destination.busRoutes.map((route, index) => (
                    <ThemedView key={index} style={styles.routeChip}>
                      <ThemedText style={styles.routeText}>{route}</ThemedText>
                    </ThemedView>
                  ))}
                </ThemedView>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      {/* Action Button */}
      <ThemedView style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={applyFilters}
        >
          <IconSymbol name="line.3.horizontal.decrease" size={20} color="#FFFFFF" />
          <ThemedText style={styles.applyButtonText}>
            Aplicar Filtros ({selectedCount})
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#212121',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  clearButton: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  filtersScroll: {
    paddingLeft: 20,
  },
  filterChip: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 14,
    color: '#757575',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  destinationsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  destinationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectedCount: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '500',
  },
  destinationsList: {
    flex: 1,
  },
  destinationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedDestinationCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  destinationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  destinationContent: {
    flex: 1,
  },
  destinationName: {
    marginBottom: 4,
    color: '#212121',
  },
  selectedText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  destinationAddress: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  selectedIcon: {
    marginLeft: 8,
  },
  destinationMeta: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#757575',
  },
  busRoutes: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  routesLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  routesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  routeChip: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  routeText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '500',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
