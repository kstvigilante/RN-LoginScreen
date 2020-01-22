import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  KeyboardAvoidingView
} from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import { TapGestureHandler, State } from "react-native-gesture-handler";
import Svg, { Image, Circle, ClipPath } from "react-native-svg";

const { height, width } = Dimensions.get("window");
const {
  Value,
  event,
  block,
  cond,
  eq,
  set,
  Clock,
  startClock,
  stopClock,
  debug,
  timing,
  clockRunning,
  interpolate,
  Extrapolate,
  concat
} = Animated;

function runTiming(clock, value, dest) {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0)
  };

  const config = {
    duration: 300,
    toValue: new Value(0),
    easing: Easing.inOut(Easing.ease)
  };

  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, value),
      set(state.frameTime, 0),
      set(config.toValue, dest),
      startClock(clock)
    ]),
    timing(clock, state, config),
    cond(state.finished, debug("stop clock", stopClock(clock))),
    state.position
  ]);
}

class MusicApp extends Component {
  constructor() {
    super();

    this.buttonOpacity = new Value(1);
    this.onStateChange = event([
      {
        nativeEvent: ({ state }) =>
          block([
            cond(
              eq(state, State.END),
              set(this.buttonOpacity, runTiming(new Clock(), 1, 0))
            )
          ])
      }
    ]);

    this.onCloseState = event([
      {
        nativeEvent: ({ state }) =>
          block([
            cond(
              eq(state, State.END),
              set(this.buttonOpacity, runTiming(new Clock(), 0, 1))
            )
          ])
      }
    ]);
    this.buttonY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [100, 0],
      extrapolate: Extrapolate.CLAMP
    });

    this.bgY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [-height / 2, 0],
      extrapolate: Extrapolate.CLAMP
    });

    this.textInputZindex = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [1, -1],
      extrapolate: Extrapolate.CLAMP
    });

    this.textInputY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [0, 100],
      extrapolate: Extrapolate.CLAMP
    });

    this.textInputOpacity = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [1, 0],
      extrapolate: Extrapolate.CLAMP
    });

    this.rotateCross = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [180, 360],
      extrapolate: Extrapolate.CLAMP
    });
  }
  render() {
    return (
      <KeyboardAvoidingView
        style={{
          
          backgroundColor: "white",
          justifyContent: "flex-end",
          flexGrow: 1
        }}
        behavior="padding"
        enabled
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "white",
            justifyContent: "flex-end",
            marginBottom: -50
          }}
        >
          <Animated.View
            style={{
              ...StyleSheet.absoluteFill,
              transform: [{ translateY: this.bgY }],
              justifyContent: "flex-end"
            }}
          >
            <Svg height={height+50} width={width} fill="none">
              <ClipPath id="clip" fill="none">
                <Circle r={height+50} fill="none" cx={width/2}></Circle>
              </ClipPath>
              <Image
                href={require("../assets/bg.jpg")}
                height={height+50}
                width={width}
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#clip)"
                fill="none"
              />
            </Svg>
          </Animated.View>
          <View style={{ height: height / 2, justifyContent: "center" }}>
            <TapGestureHandler onHandlerStateChange={this.onStateChange}>
              <Animated.View
                style={{
                  ...styles.button,
                  opacity: this.buttonOpacity,
                  transform: [{ translateY: this.buttonY }]
                }}
              >
                <Text style={{ fontSize: 20 }}>SIGN IN</Text>
              </Animated.View>
            </TapGestureHandler>

            <Animated.View
              style={{
                ...styles.button,
                backgroundColor: "steelblue",
                opacity: this.buttonOpacity,
                transform: [{ translateY: this.buttonY }]
              }}
            >
              <Text style={{ fontSize: 20, color: "white" }}>
                SIGN IN WITH FACEBOOK
              </Text>
            </Animated.View>

            <Animated.View
              style={{
                zIndex: this.textInputZindex,
                opacity: this.textInputOpacity,
                transform: [{ translateY: this.textInputY }],
                ...StyleSheet.absoluteFill,
                justifyContent: "center",
                backgroundColor: "white"
              }}
            >
              <TapGestureHandler onHandlerStateChange={this.onCloseState}>
                <Animated.View style={styles.closeButton}>
                  <Animated.Text
                    style={{
                      fontSize: 15,
                      transform: [{ rotate: concat(this.rotateCross, "deg") }]
                    }}
                  >
                    X
                  </Animated.Text>
                </Animated.View>
              </TapGestureHandler>
              <TextInput
                placeholder="EMAIL"
                style={styles.textInput}
                placeholderTextColor="#aaa"
              />

              <TextInput
                placeholder="PASSWORD"
                style={styles.textInput}
                placeholderTextColor="#aaa"
                secureTextEntry={true}
              />

              <Animated.View style={{ ...styles.button, ...styles.signInBtn }}>
                <Text style={{ fontSize: 20, color: "white" }}>SIGN IN</Text>
              </Animated.View>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  button: {
    backgroundColor: "white",
    height: 50,
    marginHorizontal: 20,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 5,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "black",
    shadowOpacity: 0.2,
    elevation: 1
  },
  closeButton: {
    height: 40,
    width: 40,
    backgroundColor: "white",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    top: -25,
    left: width / 2 - 20,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: "black",
    shadowOpacity: 0.2,
    elevation: 1
  },
  textInput: {
    height: 50,
    borderRadius: 15,
    borderWidth: 0.5,
    marginHorizontal: 20,
    paddingLeft: 10,
    marginVertical: 5,
    borderColor: "rgba(0,0,0,0.2)"
  },
  signInBtn: {
    backgroundColor: "steelblue",
    color: "white"
  }
});

export default MusicApp;
