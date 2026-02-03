import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

interface SelectItem {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  items: SelectItem[];
  placeholder?: string;
}

export function Select({ value, onValueChange, items, placeholder }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedItem = items.find(item => item.value === value);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        style={styles.trigger}
      >
        <Text style={styles.triggerText}>
          {selectedItem ? selectedItem.label : placeholder || 'Select...'}
        </Text>
        <ChevronDown size={20} color="#64748b" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <ScrollView>
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  onPress={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                  style={[
                    styles.item,
                    value === item.value && styles.itemSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.itemText,
                      value === item.value && styles.itemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
  },
  triggerText: {
    fontSize: 16,
    color: '#1e293b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    maxHeight: '80%',
    width: '80%',
    maxWidth: 400,
  },
  item: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  itemSelected: {
    backgroundColor: '#eef2ff',
  },
  itemText: {
    fontSize: 16,
    color: '#1e293b',
  },
  itemTextSelected: {
    color: '#4f46e5',
    fontWeight: '600',
  },
});
