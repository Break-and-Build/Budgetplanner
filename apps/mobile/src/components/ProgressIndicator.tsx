import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <View key={step} style={styles.stepContainer}>
          <View
            style={[
              styles.step,
              step < currentStep && styles.stepCompleted,
              step === currentStep && styles.stepCurrent,
              step > currentStep && styles.stepPending,
            ]}
          >
            {step < currentStep ? (
              <Check size={16} color="#ffffff" />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  step === currentStep && styles.stepNumberCurrent,
                  step > currentStep && styles.stepNumberPending,
                ]}
              >
                {step}
              </Text>
            )}
          </View>
          {index < steps.length - 1 && (
            <View
              style={[
                styles.connector,
                step < currentStep && styles.connectorCompleted,
                step >= currentStep && styles.connectorPending,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {
    backgroundColor: '#10b981',
  },
  stepCurrent: {
    backgroundColor: '#4f46e5',
  },
  stepPending: {
    backgroundColor: '#e2e8f0',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  stepNumberCurrent: {
    color: '#ffffff',
  },
  stepNumberPending: {
    color: '#94a3b8',
  },
  connector: {
    width: 32,
    height: 2,
    marginHorizontal: 4,
  },
  connectorCompleted: {
    backgroundColor: '#10b981',
  },
  connectorPending: {
    backgroundColor: '#e2e8f0',
  },
});
