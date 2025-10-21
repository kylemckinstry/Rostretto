import * as React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, ScrollView, useWindowDimensions } from 'react-native';
import Header from '../components/Header'; // Web-specific header automatically loads
import { ArrowUpRight } from 'lucide-react-native';
import { colours } from '../theme/colours';

export default function FairnessScreenWeb() {
  const { width } = useWindowDimensions();
  
  // Responsive breakpoints matching other web screens
  const isCompact = width < 900;
  const isSmall = width < 640;

  const handleLearnMore = () => {
    // Placeholder action – will link to concept later
    console.log('Learn more about Fairness');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colours.bg.subtle }}>
      <Header />

      <ScrollView style={s.page} contentContainerStyle={s.pageContentWrapper}>
        <View style={s.pageContent}>
          {/* Future implementation banner */}
          <View style={[s.bannerSection, isCompact && s.bannerSectionCompact]}>
            <View style={[s.bannerCard, isCompact && s.bannerCardCompact]}>
              <View style={s.bannerContent}>
                <Text style={[s.futureText, isCompact && s.futureTextCompact]}>
                  Future Implementation: Fairness Dashboard
                </Text>
                <Text style={[s.bannerSubtitle, isCompact && s.bannerSubtitleCompact]}>
                  This feature is currently in development
                </Text>
              </View>
            </View>
          </View>

          {/* Main content card */}
          <View style={s.section}>
            <View style={[s.contentCard, isCompact && s.contentCardCompact]}>
              <Text style={[s.cardTitle, isCompact && s.cardTitleCompact]}>
                Understanding Fairness
              </Text>
              <Text style={[s.cardBody, isCompact && s.cardBodyCompact]}>
                Fair shift distribution is key to team morale, retention, and compliance. 
                Our dashboard makes it easy to spot and fix imbalances, creating a healthier 
                workplace for everyone.
              </Text>

              <Pressable 
                style={[s.learnMoreButton, isCompact && s.learnMoreButtonCompact]} 
                onPress={handleLearnMore}
              >
                <ArrowUpRight 
                  width={isCompact ? 16 : 18} 
                  height={isCompact ? 16 : 18} 
                  color={colours.brand.primary}
                />
                <Text style={[s.learnMoreText, isCompact && s.learnMoreTextCompact]}>
                  Learn More
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Preview features section */}
          <View style={s.section}>
            <Text style={[s.sectionTitle, isCompact && s.sectionTitleCompact]}>
              Coming Soon
            </Text>
            
            <View style={[s.featuresGrid, isCompact && s.featuresGridCompact]}>
              <View style={[s.featureCard, isCompact && s.featureCardCompact]}>
                <Text style={[s.featureTitle, isCompact && s.featureTitleCompact]}>
                  Fairness Scoring
                </Text>
                <Text style={[s.featureDescription, isCompact && s.featureDescriptionCompact]}>
                  Track individual fairness scores based on shift distribution and preferences
                </Text>
              </View>

              <View style={[s.featureCard, isCompact && s.featureCardCompact]}>
                <Text style={[s.featureTitle, isCompact && s.featureTitleCompact]}>
                  Balance Analytics
                </Text>
                <Text style={[s.featureDescription, isCompact && s.featureDescriptionCompact]}>
                  Visual analytics showing distribution patterns and potential improvements
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  page: { 
    flex: 1, 
    backgroundColor: colours.bg.subtle 
  },
  pageContentWrapper: { 
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: colours.bg.subtle,
    paddingBottom: 24,
    paddingTop: 80,
    flexGrow: 1,
    ...Platform.select({
      web: {
        minHeight: '100vh',
      },
    }),
  } as any,
  pageContent: { 
    width: '100%',
    maxWidth: 800,
    paddingHorizontal: 16,
    backgroundColor: colours.bg.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        minHeight: 'auto',
      },
    }),
  } as any,
  bannerSection: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  bannerSectionCompact: {
    marginBottom: 20,
  },
  bannerCard: {
    backgroundColor: colours.brand.primary,
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
  },
  bannerCardCompact: {
    padding: 24,
    maxWidth: '100%',
  },
  bannerContent: {
    alignItems: 'center',
  },
  futureText: {
    color: colours.bg.canvas,
    fontWeight: '800',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  futureTextCompact: {
    fontSize: 28,
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: colours.bg.canvas,
    fontWeight: '400',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  bannerSubtitleCompact: {
    fontSize: 14,
  },
  noticeSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  noticeSectionCompact: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  noticeText: {
    color: colours.bg.canvas,
    fontWeight: '800',
    fontSize: 32,
    marginBottom: 8,
    textAlign: 'center',
    backgroundColor: colours.status.warning,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colours.status.warning,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 600,
  },
  noticeTextCompact: {
    fontSize: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    maxWidth: '100%',
  },
  noticeSubtext: {
    color: colours.text.primary,
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 12,
    backgroundColor: colours.bg.canvas,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colours.border.default,
  },
  noticeSubtextCompact: {
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colours.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitleCompact: {
    fontSize: 18,
    marginBottom: 12,
  },
  contentCard: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 600,
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  } as any,
  contentCardCompact: {
    padding: 24,
    maxWidth: '100%',
  },
  futureNotice: {
    backgroundColor: colours.status.warning,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  futureNoticeCompact: {
    padding: 12,
    marginBottom: 20,
  },
  futureNoticeText: {
    color: colours.bg.canvas,
    fontWeight: '800',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  futureNoticeTextCompact: {
    fontSize: 18,
    marginBottom: 6,
  },
  futureNoticeSubtext: {
    color: colours.bg.canvas,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  futureNoticeSubtextCompact: {
    fontSize: 13,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colours.brand.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  cardTitleCompact: {
    fontSize: 20,
    marginBottom: 12,
  },
  cardBody: {
    fontSize: 16,
    color: colours.text.secondary,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
    maxWidth: 500,
  },
  cardBodyCompact: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        ':hover': {
          backgroundColor: '#E9F0EC',
        },
      },
    }),
  } as any,
  learnMoreButtonCompact: {
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  learnMoreText: {
    color: colours.brand.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  learnMoreTextCompact: {
    fontSize: 15,
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: 24,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  featuresGridCompact: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
  },
  featureCard: {
    backgroundColor: colours.bg.canvas,
    borderRadius: 12,
    padding: 24,
    width: 280,
    alignItems: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  } as any,
  featureCardCompact: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colours.brand.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureTitleCompact: {
    fontSize: 16,
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: colours.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  featureDescriptionCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
});

if (Platform.OS !== 'web') {
  console.warn('FairnessScreen.web.tsx loaded on non-web platform');
}