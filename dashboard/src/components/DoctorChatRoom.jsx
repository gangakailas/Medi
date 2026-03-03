import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import io from "socket.io-client";
import Peer from "simple-peer";

const SOCKET_URL = "http://localhost:4000";

const DoctorChatRoom = () => {
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
                navigateTo("/consultations");
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

    useEffect(() => {
        if (!consultation || !user._id) return;

        const socket = io(SOCKET_URL, { withCredentials: true });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("joinRoom", {
                roomId: consultation.roomId,
                userName: `Dr. ${user.firstName} ${user.lastName}`,
                userRole: "Doctor",
            });
        });

        socket.on("chatMessage", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on("userJoined", (data) => {
            toast.info(`${data.userName} joined the consultation`);
            if (stream && !peerRef.current) {
                initiateCall(socket, data.socketId);
            }
        });

        socket.on("incomingCall", (data) => {
            if (stream) {
                answerCall(socket, data);
            }
        });

        socket.on("callAccepted", (data) => {
            if (peerRef.current) {
                peerRef.current.signal(data.signal);
            }
        });

        socket.on("userLeft", (data) => {
            toast.info(`${data.userName || "Patient"} left the consultation`);
            setRemoteConnected(false);
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null;
            }
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        });

        axios
            .put(`${SOCKET_URL}/api/v1/consultation/join/${id}`, {}, { withCredentials: true })
            .catch((err) => console.error(err));

        return () => {
            socket.emit("leaveRoom", {
                roomId: consultation.roomId,
                userName: `Dr. ${user.firstName} ${user.lastName}`,
            });
            socket.disconnect();
            if (peerRef.current) {
                peerRef.current.destroy();
                peerRef.current = null;
            }
        };
    }, [consultation, user, stream]);

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
            toast.error("Could not access camera/microphone");
            console.error(err);
        }
    };

    const initiateCall = (socket, targetSocketId) => {
        if (!stream) return;
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on("signal", (signal) => {
            socket.emit("callUser", {
                to: targetSocketId,
                signal,
                from: socket.id,
                userName: `Dr. ${user.firstName} ${user.lastName}`,
            });
        });

        peer.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
            setRemoteConnected(true);
        });

        peer.on("error", (err) => console.error("Peer error:", err));
        peerRef.current = peer;
    };

    const answerCall = (socket, data) => {
        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on("signal", (signal) => {
            socket.emit("answerCall", { to: data.from, signal });
        });

        peer.on("stream", (remoteStream) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = remoteStream;
            }
            setRemoteConnected(true);
        });

        peer.on("error", (err) => console.error("Peer error:", err));
        peer.signal(data.signal);
        peerRef.current = peer;
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socketRef.current) return;

        socketRef.current.emit("chatMessage", {
            roomId: consultation.roomId,
            consultationId: id,
            message: newMessage,
            senderId: user._id,
            senderName: `Dr. ${user.firstName} ${user.lastName}`,
            senderRole: "Doctor",
        });
        setNewMessage("");
    };

    const toggleCamera = () => {
        if (stream) {
            stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
            setCameraOn(!cameraOn);
        }
    };

    const toggleMic = () => {
        if (stream) {
            stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
            setMicOn(!micOn);
        }
    };

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
            stream.getTracks().forEach((t) => t.stop());
        }
        navigateTo("/consultations");
    };

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
                    <h2>{consultation.patient.firstName} {consultation.patient.lastName}</h2>
                    <span className="department-tag">{consultation.department}</span>
                </div>
                <div className="consultation-header-actions">
                    <button className="end-call-btn" onClick={endConsultation}>
                        End Consultation
                    </button>
                </div>
            </div>

            <div className="consultation-body">
                <div className="video-section">
                    <div className="video-container">
                        <div className="video-wrapper remote-video-wrapper">
                            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />
                            {!remoteConnected && (
                                <div className="video-placeholder">
                                    <p>Waiting for patient to join...</p>
                                </div>
                            )}
                        </div>
                        <div className="video-wrapper local-video-wrapper">
                            <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
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
                            >
                                {cameraOn ? "📷" : "🚫"}
                            </button>
                            <button
                                className={`control-btn ${!micOn ? "off" : ""}`}
                                onClick={toggleMic}
                            >
                                {micOn ? "🎤" : "🔇"}
                            </button>
                        </div>
                    )}
                </div>

                <div className="chat-section">
                    <div className="chat-header">
                        <h3>💬 Chat</h3>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`chat-msg ${msg.senderId === user._id ? "sent" : "received"}`}
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

export default DoctorChatRoom;
