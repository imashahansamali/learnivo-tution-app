import React from "react";
import { StyleSheet, View } from "react-native";

export default function LearnivoIcon() {
  return (
    <View style={styles.icon} accessible={false} aria-hidden>
      <View style={styles.pin} />
      <View style={styles.book}>
        <View style={[styles.page, styles.leftPage]} />
        <View style={[styles.page, styles.rightPage]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { width: 44, height: 44, flexShrink: 0 },
  pin: {
    position: "absolute",
    width: 29,
    height: 29,
    top: 5,
    left: 7.5,
    backgroundColor: "#FFD36A",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 3,
    transform: [{ rotate: "45deg" }],
  },
  book: {
    position: "absolute",
    top: 12,
    left: 13,
    flexDirection: "row",
    gap: 2,
  },
  page: { width: 8, height: 12, backgroundColor: "#FFFFFF" },
  leftPage: { borderTopLeftRadius: 2, borderTopRightRadius: 3, borderBottomLeftRadius: 2 },
  rightPage: { borderTopLeftRadius: 3, borderTopRightRadius: 2, borderBottomRightRadius: 2 },
});
