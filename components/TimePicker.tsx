import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, FlatList } from 'react-native';

// Create the base array for hours.
const BASE_HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
// Create a large, repeating array to simulate infinite scrolling.
const HOURS = Array.from({ length: 100 }).flatMap(() => BASE_HOURS);
const MINUTES = ['00', '30'];
const PERIODS = ['AM', 'PM'];
const ITEM_HEIGHT = 50;

// Helper to parse a time string (e.g., "9:30 AM") into a Date object
const parseTime = (timeStr: string): Date => {
  const date = new Date();
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toLowerCase();

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0; // Midnight case
    
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
};

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  initialValue: string;
};

export default function TimePicker({ isVisible, onClose, onConfirm, initialValue }: Props) {
  const [hour, setHour] = useState('9');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  const hourRef = useRef<FlatList>(null);
  const minuteRef = useRef<FlatList>(null);
  const periodRef = useRef<FlatList>(null);

  // Set the picker's initial state when it becomes visible
  useEffect(() => {
    if (isVisible) {
      const initialDate = parseTime(initialValue);
      const initialHours = initialDate.getHours();
      
      const p = initialHours >= 12 ? 'PM' : 'AM';
      let h = initialHours % 12;
      if (h === 0) h = 12;

      const m = initialDate.getMinutes() >= 30 ? '30' : '00';

      setHour(String(h));
      setMinute(m);
      setPeriod(p);

      // Scroll the lists to the initial time.
      setTimeout(() => {
        // For the hours list, find the index in the base array.
        const hourIndex = BASE_HOURS.indexOf(String(h));
        // Then calculate the target index in the middle of the large, repeating array.
        const targetHourIndex = hourIndex >= 0 ? hourIndex + (BASE_HOURS.length * 50) : 0;
        
        hourRef.current?.scrollToIndex({ index: targetHourIndex, animated: false });
        minuteRef.current?.scrollToIndex({ index: MINUTES.indexOf(m), animated: false });
        periodRef.current?.scrollToIndex({ index: PERIODS.indexOf(p), animated: false });
      }, 50);
    }
  }, [isVisible, initialValue]);

  const handleConfirm = () => {
    const newDate = new Date();
    let h = parseInt(hour, 10);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    newDate.setHours(h, parseInt(minute, 10), 0, 0);
    onConfirm(newDate);
  };
  
  const onScrollEnd = (event: any, setter: Function, data: string[]) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    if (data[index]) {
      setter(data[index]);
    }
  };

  const renderItem = ({ item }: { item: string }) => (
    <View style={s.itemContainer}>
      <Text style={s.itemText}>{item}</Text>
    </View>
  );

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose} />
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.headerText}>Select Time</Text>
        </View>

        <View style={s.pickerContainer}>
          <View style={s.selectionIndicator} />
          <FlatList
            ref={hourRef}
            data={HOURS}
            renderItem={renderItem}
            keyExtractor={(_, index) => `h-${index}`} // Key must be unique.
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
            onMomentumScrollEnd={(e) => onScrollEnd(e, setHour, HOURS)}
            getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
            initialScrollIndex={BASE_HOURS.length * 50} // Start in the middle of the list.
          />
          <Text style={s.separator}>:</Text>
          <FlatList
            ref={minuteRef}
            data={MINUTES}
            renderItem={renderItem}
            keyExtractor={item => `m-${item}`}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
            onMomentumScrollEnd={(e) => onScrollEnd(e, setMinute, MINUTES)}
            getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          />
          <FlatList
            ref={periodRef}
            data={PERIODS}
            renderItem={renderItem}
            keyExtractor={item => `p-${item}`}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
            onMomentumScrollEnd={(e) => onScrollEnd(e, setPeriod, PERIODS)}
            getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
          />
        </View>

        <View style={s.footer}>
          <Pressable style={[s.button, s.cancelButton]} onPress={onClose}>
            <Text style={s.buttonText}>Cancel</Text>
          </Pressable>
          <Pressable style={[s.button, s.confirmButton]} onPress={handleConfirm}>
            <Text style={[s.buttonText, s.confirmButtonText]}>Confirm</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#F4F4F1',
    borderRadius: 16,
    width: '85%',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4ECE8',
  },
  headerText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1A4331',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: ITEM_HEIGHT * 5, // Shows 5 items at a time
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 20,
    right: 20,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(26, 67, 49, 0.08)',
    borderRadius: 8,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2D2D2D',
  },
  separator: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2D2D2D',
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E4ECE8',
  },
  button: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#E4ECE8',
  },
  confirmButton: {
    backgroundColor: '#1A4331',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A4331',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});