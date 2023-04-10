import { useState, useEffect, useRef, useContext } from "react";
import {
	StyleSheet,
	Text,
	View,
	Image,
	Pressable,
	Vibration,
} from "react-native";
import Toast from "react-native-toast-message";

import { io } from "socket.io-client";
import { Colors } from "../utils/Colors";
import { AuthContext } from "../utils/AuthContext";

export default function Content({ navigation }) {
	const [gameActive, setGameActive] = useState(false);
	const [currentText, setCurrentText] = useState("");
	const [socket, setSocket] = useState(null);
	const [msgQueue, setMsgQueue] = useState(["Hello from Bearmax!"]);
	const [buttonColors, setButtonColors] = useState({
		calibrate: Colors.buttonLight,
		play: Colors.buttonDark,
		help: Colors.buttonDark,
		engage: Colors.buttonLight,
	});

	const { logout, user } = useContext(AuthContext);

	const queueRef = useRef();
	queueRef.current = msgQueue;
	const text = useRef();
	text.current = currentText;
	const count = useRef(0);

	const toast = (type = "error", text1 = "") => {
		Toast.show({
			type,
			text1,
		});
	};

	// TODO: Make less gross and not on an interval
	useEffect(() => {
		const interval = setInterval(() => {
			const LEAVE_DUR = 4; // sec
			const currentQueue = queueRef.current;

			if (count.current > 0)
				count.current = (count.current + 1) % (LEAVE_DUR + 1);
			if (count.current == 0) {
				if (currentQueue.length == 0) {
					if (
						text.current !== "" &&
						text.current !== "Hello from Bearmax!"
					)
						setCurrentText("");
					return;
				}

				setCurrentText(currentQueue[0]);
				Vibration.vibrate(1001);
				currentQueue.splice(0, 1);
				setMsgQueue(currentQueue);
				count.current++;
			}
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const URL = "https://carewithbearmax.com";

		console.log(
			"Attempting to connect to " +
				URL +
				" with token '" +
				user.token +
				"'"
		);
		const newSocket = io(URL, {
			query: {
				userID: user.id,
			},
		});

		newSocket.on("connect", () => {
			console.log("Successfully connected to the server.");
			setSocket(newSocket);

			newSocket.on("speak", (newMsg) => {
				console.log("Received speech: " + newMsg);
				const newQueue = [...queueRef.current, newMsg];
				setMsgQueue(newQueue);
			});
		});

		newSocket.on("disconnect", () => console.log("Socket disconnected"));

		return () => {
			console.log("Disconnecting socket");
			newSocket.close();
		};
	}, [navigation]);

	const emotionGame = () => {
		if (!socket) return;
		if (gameActive) socket.emit("emotionGame", "stop", user.id);
		else socket.emit("emotionGame", "start", user.id);
		setGameActive(!gameActive);
	};

	const calibrate = () => {
		setMsgQueue([...msgQueue, "Recalibrating!"]);
		if (!socket) return;
		socket.emit("recalibrate");
	};

	const handleLogout = async () => {
		const error = await logout();
		if (error) toast("error", error);
		else toast("success", "Logged Out!");
	};

	return (
		<View style={styles.container}>
			<Image
				style={styles.logo}
				source={require("../../assets/face.png")}
			/>
			<Text style={styles.assist}>{currentText}</Text>

			<View style={styles.container2}>
				<Pressable
					style={{
						...styles.button,
						backgroundColor: buttonColors.calibrate,
					}}
					onPress={calibrate}
					onPressIn={() =>
						setButtonColors({
							...buttonColors,
							calibrate: Colors.buttonLightActive,
						})
					}
					onPressOut={() =>
						setButtonColors({
							...buttonColors,
							calibrate: Colors.buttonLight,
						})
					}
				>
					<Text style={styles.text}>Calibrate</Text>
				</Pressable>

				<Pressable
					style={{
						...styles.button1,
						backgroundColor: buttonColors.play,
					}}
					onPress={emotionGame}
					onPressIn={() =>
						setButtonColors({
							...buttonColors,
							play: Colors.buttonDarkActive,
						})
					}
					onPressOut={() =>
						setButtonColors({
							...buttonColors,
							play: Colors.buttonDark,
						})
					}
				>
					<Text style={styles.text}>
						{gameActive ? "Stop Game" : "Play!"}
					</Text>
				</Pressable>
			</View>

			<View style={styles.container2}>
				<Pressable
					style={{
						...styles.button1,
						backgroundColor: buttonColors.help,
					}}
					onPressIn={() =>
						setButtonColors({
							...buttonColors,
							help: Colors.buttonDarkActive,
						})
					}
					onPressOut={() =>
						setButtonColors({
							...buttonColors,
							help: Colors.buttonDark,
						})
					}
					onPress={() => {
						// TODO
						console.log("Not yet implemented!");
					}}
				>
					<Text style={styles.text}>Engage</Text>
				</Pressable>
				<Pressable
					style={{
						...styles.button,
						backgroundColor: buttonColors.engage,
					}}
					onPressIn={() =>
						setButtonColors({
							...buttonColors,
							engage: Colors.buttonLightActive,
						})
					}
					onPressOut={() =>
						setButtonColors({
							...buttonColors,
							engage: Colors.buttonLight,
						})
					}
					onPress={handleLogout}
				>
					<Text style={styles.text}>Log Out</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.brown,
		alignItems: "center",
	},
	container2: {
		flexDirection: "row",
		marginTop: 20,
	},
	logo: {
		width: 250,
		height: 250,
		marginTop: 50,
	},
	button: {
		paddingVertical: 40,
		width: 180,
		height: 100,
		borderRadius: 4,
		elevation: 3,
		marginRight: 8,
	},
	button1: {
		paddingVertical: 40,
		height: 100,
		width: 180,
		borderRadius: 4,
		elevation: 3,
		marginRight: 8,
	},
	text: {
		fontSize: 16,
		lineHeight: 21,
		fontWeight: "bold",
		letterSpacing: 0.25,
		color: Colors.text,
		textAlign: "center",
	},
	assist: {
		backgroundColor: "#60463b",
		width: 365,
		height: 50,
		textAlign: "center",
		paddingVertical: 15,
		marginTop: 50,

		fontSize: 16,
		lineHeight: 21,
		fontWeight: "bold",
		letterSpacing: 0.25,
		color: "white",
	},
});
