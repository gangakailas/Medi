import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import io from "socket.io-client";
import Peer from "simple-peer";

const SOCKET_URL = "http://localhost:4000";

const ConsultationRoom = () => {
    const { id } = useParams();
    const { user, isAuthenticated } = useContext(Context);
    const navigateTo = useNavigate();

    const [consultation, setConsultation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [stream, setStream] = useState(null);
    const [callStarted, setCallStarted] = useState(false);
    const [remoteConnected, setRemoteConnected] = useState(false);
    const [cameraOn, setCameraOn] = useState(true);
    const [micOn, setMicOn] = useState(true);

    const socketRef = useRef(null);
    const peerRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const chatEndRef = useRef(null);

    // Fetch consultation details
    useEffect(() => {
        if (!isAuthenticated) {
            navigateTo("/login");
            return;
        }

        const fetchConsultation = async () => {
            try {
                const { data } = await axios.get(
                    `${SOCKET_URL}/api/v1/consultation/${id}`,
                    { withCredentials: true }
                );
                setConsultation(data.consultation);
            } catch (err) {
                toast.error("Could not load consultation");
                navigateTo("/online");
            }
        };

        const fetchChatHistory = async () => {
            try {
                const { data } = await axios.get(
                    `${SOCKET_URL}/api/v1/consultation/chat/${id}`,
                    { withCredentials: true }
                );
                setMessages(data.messages);
            } catch (err) {
                console.error("Error fetching chat:", err);
            }
        };

        fetchConsultation();
        fetchChatHistory();
    }, [id, isAuthenticated]);

    // Set up socket connection
    useEffect(() => {
        if (!consultation || !user._id) return;

        const socket = io(SOCKET_URL, { withCredentials: true });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("joinRoom", {
                roomId: consultation.roomId,
                userName: `${user.firstName} ${user.lastName}`,
                userRole: user.role,
            });
        });

        // Listen for chat messages
        socket.on("chatMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        // Listen for remote user joining
        socket.on("userJoined", (data) => {
            toast.info(`${data.userName} joined the consultation`);
            // If we already have a stream and peer isn't started, initiate call
            if (stream && !peerRef.current) {
                initiateCall(socket, data.socketId);
            }
        });

        // Listen for incoming call (WebRTC offer)
        socket.on("incomingCall", (data) => {
            if (stream) {
                answerCall(socket, data);
            }
        });

        // Listen for call accepted
        socket.on("callAccepted", (data) => {
            if (peerRef.current) {
                peerRef.current.signal(data.signal);
            }
        });

        // User left
        socket.on("userLeft", (data) => {
            toast.info(`${data.userName || "User"} left the consultation`);
            setRemoteConnected(false);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        });

        // Mark consultation as active
        axios
            .put(`${SOCKET_URL}/api/v1/consultation/join/${id}`, {}, { withCredentials: true })
            .catch((err) => console.error(err));

        return () => {
            socket.emit("leaveRoom", {
                roomId: consultation.roomId,
                userName: `${user.firstName} ${user.lastName}`,
            });
            socket.disconnect();
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        };
    }, [consultation, user, stream]);

    // Start camera
    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setStream(mediaStream);
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = mediaStream;
            }
            setCallStarted(true);
        } catch (err) {
            toast.error("Could not access camera/microphone. Please check permissions.");
            console.error(err);
        }
    };

    // Initiate a WebRTC call
    const initiateCall = (socket, targetSocketId) => {
        if (!stream) return;

        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (signal) => {
            socket.emit("callUser", {
                to: targetSocketId,
                signal,
                from: socket.id,
                userName: `${user.firstName} ${user.lastName}`,
            });
        });

        peer.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
            setRemoteConnected(true);
        });

        peer.on("error", (err) => {
            console.error("Peer error:", err);
        });

        peerRef.current = peer;
    };

    // Answer an incoming call
    const answerCall = (socket, data) => {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (signal) => {
            socket.emit("answerCall", { to: data.from, signal });
        });

        peer.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
            setRemoteConnected(true);
        });

        peer.on("error", (err) => {
            console.error("Peer error:", err);
        });

        peer.signal(data.signal);
        peerRef.current = peer;
    };

    // Send chat message
    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;

        socketRef.current.emit("chatMessage", {
            roomId: consultation.roomId,
            consultationId: id,
            message: newMessage,
            senderId: user._id,
            senderName: `${user.firstName} ${user.lastName}`,
            senderRole: user.role,
        });

        setNewMessage("");
    };

    // Toggle camera
    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setCameraOn(!cameraOn);
        }
    };

    // Toggle mic
    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setMicOn(!micOn);
        }
    };

    // End consultation
    const endConsultation = async () => {
        try {
            await axios.put(
                `${SOCKET_URL}/api/v1/consultation/end/${id}`,
                {},
                { withCredentials: true }
            );
            toast.success("Consultation ended");
        } catch (err) {
            console.error(err);
        }
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        navigateTo("/online");
    };

    // Leave room (for patients)
    const leaveRoom = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        navigateTo("/online");
    };

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!consultation) {
        return (
            <div className="consultation-loading">
                <div className="spinner"></div>
                <p>Loading consultation...</p>
            </div>
        );
    }

    return (
        <div className="consultation-room">
            <div className="consultation-header">
                <div className="consultation-header-info">
                    <h2>
                        {user.role === "Patient"
                            ? `Dr. ${consultation.doctor.firstName} ${consultation.doctor.lastName}`
                            : `${consultation.patient.firstName} ${consultation.patient.lastName}`}
                    </h2>
                    <span className="department-tag">{consultation.department}</span>
                </div>
                <div className="consultation-header-actions">
                    {user.role === "Doctor" ? (
                        <button className="end-call-btn" onClick={endConsultation}>
                            End Consultation
                        </button>
                    ) : (
                        <button className="leave-btn" onClick={leaveRoom}>
                            Leave
                        </button>
                    )}
                </div>
            </div>

            <div className="consultation-body">
                {/* Video Section */}
                <div className="video-section">
                    <div className="video-container">
                        <div className="video-wrapper remote-video-wrapper">
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                className="remote-video"
                            />
                            {!remoteConnected && (
                                <div className="video-placeholder">
                                    <p>Waiting for the other person to join...</p>
                                </div>
                            )}
                        </div>
                        <div className="video-wrapper local-video-wrapper">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className="local-video"
                            />
                            {!callStarted && (
                                <div className="video-placeholder local-placeholder">
                                    <button className="start-camera-btn" onClick={startCamera}>
                                        🎥 Start Camera
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {callStarted && (
                        <div className="video-controls">
                            <button
                                className={`control-btn ${!cameraOn ? "off" : ""}`}
                                onClick={toggleCamera}
                                title={cameraOn ? "Turn off camera" : "Turn on camera"}
                            >
                                {cameraOn ? "📷" : "🚫"}
                            </button>
                            <button
                                className={`control-btn ${!micOn ? "off" : ""}`}
                                onClick={toggleMic}
                                title={micOn ? "Mute" : "Unmute"}
                            >
                                {micOn ? "🎤" : "🔇"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Chat Section */}
                <div className="chat-section">
                    <div className="chat-header">
                        <h3>💬 Chat</h3>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`chat-msg ${msg.senderId === user._id ? "sent" : "received"
                                    }`}
                            >
                                <span className="chat-sender">{msg.senderName}</span>
                                <p className="chat-text">{msg.message}</p>
                                <span className="chat-time">
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <form className="chat-input-form" onSubmit={sendMessage}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ConsultationRoom;
