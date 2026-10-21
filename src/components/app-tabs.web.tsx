import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet, Text, useWindowDimensions } from 'react-native';
import { THEME } from '@/constants/theme';
import { Map, Compass, Trophy, PlusCircle, User, SlidersHorizontal } from 'lucide-react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%', flex: 1 }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton
              title="Bản đồ"
              icon={(active) => (
                <Map
                  size={21}
                  color={active ? THEME.colors.primary : THEME.colors.textMuted}
                  strokeWidth={active ? 2.4 : 1.8}
                />
              )}
            />
          </TabTrigger>

          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton
              title="Khám phá"
              icon={(active) => (
                <Compass
                  size={21}
                  color={active ? THEME.colors.primary : THEME.colors.textMuted}
                  strokeWidth={active ? 2.4 : 1.8}
                />
              )}
            />
          </TabTrigger>

          <TabTrigger name="leaderboard" href="/leaderboard" asChild>
            <TabButton
              title="Xếp hạng"
              icon={(active) => (
                <Trophy
                  size={21}
                  color={active ? THEME.colors.primary : THEME.colors.textMuted}
                  strokeWidth={active ? 2.4 : 1.8}
                />
              )}
            />
          </TabTrigger>

          <TabTrigger name="suggest" href="/suggest" asChild>
            <TabButton
              title="Thêm ĐĐ"
              icon={(active) => (
                <PlusCircle
                  size={21}
                  color={active ? THEME.colors.primary : THEME.colors.textMuted}
                  strokeWidth={active ? 2.4 : 1.8}
                />
              )}
            />
          </TabTrigger>

          <TabTrigger name="profile" href="/profile" asChild>
            <TabButton
              title="Hồ sơ"
              icon={(active) => (
                <User
                  size={21}
                  color={active ? THEME.colors.primary : THEME.colors.textMuted}
                  strokeWidth={active ? 2.4 : 1.8}
                />
              )}
            />
          </TabTrigger>

          <TabTrigger name="admin" href="/admin" asChild>
            <TabButton
              title="Admin"
              icon={(active) => (
                <SlidersHorizontal
                  size={20}
                  color={active ? '#20D6E7' : THEME.colors.textMuted}
                  strokeWidth={active ? 2.4 : 1.8}
                />
              )}
            />
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

import { triggerHaptic } from '@/utils/haptics';

export function TabButton({
  title,
  isFocused,
  icon,
  ...props
}: TabTriggerSlotProps & {
  title: string;
  icon: (active: boolean) => React.ReactNode;
}) {
  const { ref: _ref, onPress, ...pressableProps } = props as any;
  const active = !!isFocused;

  const handlePress = (e: any) => {
    triggerHaptic('selection');
    if (onPress) {
      onPress(e);
    }
  };

  return (
    <Pressable
      {...pressableProps}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.tabButton,
        pressed && styles.tabButtonPressed,
      ]}
    >
      <View style={[styles.tabIconWrapper, active && styles.tabIconWrapperActive]}>
        {icon(active)}
      </View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {title}
      </Text>
      {active && <View style={styles.activeDot} />}
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  return (
    <View style={[styles.tabBarWrapper, !isMobile && styles.tabBarFloating]}>
      <View style={[styles.tabBarContainer, !isMobile && styles.tabBarContainerFloating]}>
        <View style={styles.tabItemsRow}>
          {props.children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  tabBarFloating: {
    bottom: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tabBarContainer: {
    width: '100%',
    backgroundColor: 'rgba(17, 24, 39, 0.96)',
    backdropFilter: 'blur(20px)' as any,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
    paddingTop: 8,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 16,
  },
  tabBarContainerFloating: {
    maxWidth: 500,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    paddingBottom: 8,
  },
  tabItemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: 48,
  },
  tabButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  tabIconWrapper: {
    width: 38,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapperActive: {
    backgroundColor: 'rgba(79, 125, 255, 0.14)',
  },
  tabLabel: {
    color: THEME.colors.textMuted,
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.primary,
    marginTop: 3,
  },
});
