import { useState, useEffect, useRef } from "react";
import {
	StyleSheet,
	Text,
	View,
	Image,
	Pressable,
	Animated,
} from "react-native";

import { io } from "socket.io-client";

export default function Loading({ navigation }) {
	const [gameActive, setGameActive] = useState(false);
	const [currentText, setCurrentText] = useState("");
	const [socket, setSocket] = useState(null);
	const [msgQueue, setMsgQueue] = useState(["Hello from BEARMAX!"]);

	const queueRef = useRef();
	queueRef.current = msgQueue;
	const text = useRef();
	text.current = currentText;
	const count = useRef(0);

	// TODO: Make less gross
	useEffect(() => {
		const interval = setInterval(() => {
			const LEAVE_DUR = 4; // sec
			const currentQueue = queueRef.current;

			if (count.current > 0)
				count.current = (count.current + 1) % (LEAVE_DUR + 1);
			if (count.current == 0) {
				if (currentQueue.length == 0) {
					if (text.current !== "") setCurrentText("");
					return;
				}
				setCurrentText(currentQueue[0]);
				currentQueue.splice(0, 1);
				setMsgQueue(currentQueue);
				count.current++;
			}
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	useEffect(
		() => {
			const URL = "http://137.184.110.53:443" ?? "http://localhost:8080";

			console.log("Attempting to connect to " + URL);
			const newSocket = io(URL); // TODO: Fix with HTTPS

			newSocket.on("connect", () => {
				console.log("Successfully connected to the server.");
				setSocket(newSocket);

				newSocket.on("speak", (newMsg) => {
					console.log("Received speech: " + newMsg);
					const newQueue = [...queueRef.current, newMsg];
					// console.log(
					// 	"Adding new message to queue, which is now: ",
					// 	newQueue
					// );
					setMsgQueue(newQueue);
				});
			});

			newSocket.on("disconnect", () =>
				console.log("Socket disconnected")
			);

			return () => {
				console.log("Disconnecting socket");
				newSocket.close();
			};
		},
		[
			/*navigation*/
		]
	);

	const emotionGame = () => {
		if (!socket) return;
		if (gameActive) socket.emit("emotionGame", "stop");
		else socket.emit("emotionGame", "start");
		setGameActive(!gameActive);
	};

	const calibrate = () => {
		if (!socket) return;
		socket.emit("recalibrate");
	};

	// TODO: Test queue
	const testSpeech = () => {};

	return (
		<View style={styles.container}>
			<Image
				style={styles.logo}
				source={require("./../assets/face.png")}
			/>
			<Text style={styles.assist}>{currentText}</Text>

			<View style={styles.container2}>
				<Pressable style={styles.button} onPress={calibrate}>
					<Text style={styles.text}>Calibrate</Text>
				</Pressable>

				<Pressable style={styles.button1} onPress={emotionGame}>
					<Text style={styles.text}>
						{gameActive ? "Stop Game" : "Play!"}
					</Text>
				</Pressable>
			</View>

			<View style={styles.container2}>
				<Pressable style={styles.button1}>
					<Text style={styles.text}>Help</Text>
				</Pressable>
				<Pressable style={styles.button}>
					<Text style={styles.text}>Engage</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#856A5d",
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
		backgroundColor: "#56b19c",
		paddingVertical: 40,
		width: 180,
		height: 100,
		borderRadius: 4,
		elevation: 3,
		marginRight: 8,
	},
	button1: {
		backgroundColor: "#35604e",
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
		color: "white",
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
