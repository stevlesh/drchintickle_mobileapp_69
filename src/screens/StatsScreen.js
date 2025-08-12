import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BackgroundContainer from '../components/BackgroundContainer';
import NeonHeader from '../components/NeonHeader';
import { colors, textStyles } from '../theme/typography';
import { Martini } from 'phosphor-react-native';

const StatsScreen = () => {
  return (
    <BackgroundContainer>
      <View style={styles.container}>
        <NeonHeader 
          subtitle="TRACK YOUR MIAMI VICE GAINS"
          titleSize={32}
          subtitleSize={14}
          showPalmTrees={false}
          style={styles.header}
        />
        
        <View style={styles.content}>
          <Martini size={80} color={colors.electricCyan} weight="regular" />
          
          <Text style={styles.title}>Stats Coming Soon</Text>
          
          <Text style={styles.description}>
            Your pull-up analytics, progress charts, and Miami Vice achievements will appear here.
          </Text>
          
          <Text style={styles.subtitle}>
            Keep crushing those workouts! 🌴
          </Text>
        </View>
      </View>
    </BackgroundContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100, // Account for tab bar
  },
  title: {
    fontFamily: 'IBMPlexMono_700Bold',
    fontSize: 28,
    color: colors.white,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  description: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 16,
    color: colors.lightGray,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  subtitle: {
    fontFamily: 'IBMPlexMono_400Regular',
    fontSize: 14,
    color: colors.electricCyan,
    textAlign: 'center',
  },
});

export default StatsScreen;