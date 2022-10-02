import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { LogsList } from "../components/LogsList";

import styles from "../styles/Home.module.css";
import { LogMessage } from "../types";

const Home: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [applied, setApplied] = useState<boolean>(false);

  const sessionIdRef = useRef<HTMLInputElement | null>(null);
  const categoryRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (applied) {
      const socket = io(`ws://${location.host.replace(":3000", "")}:3001`, {
        transports: ["websocket"],
      });

      socket.on("apply-log", (message) => {
        setLogs((currentLogs) => [...currentLogs, message]);
      });

      return () => {
        socket.removeListener("apply-log");
      };
    }
  }, [applied]);

  const handleApply = async () => {
    try {
      const sessionId = sessionIdRef?.current?.value;
      const category = categoryRef?.current?.value;
      const message = messageRef?.current?.value;

      setApplied(true);
      setSuccess(false);
      setLoading(true);

      if (sessionId && category && message) {
        const response = await fetch("/api/apply", {
          method: "POST",
          body: JSON.stringify({ sessionId, category, message }),
        });

        const json = await response.json();

        if (json.success) {
          setSuccess(true);
        }
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Apply in Djinni automatically</title>
        <meta name="description" content="Djinni Automation" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1>
          Djinni Automated Applying
          {/* First 5 Applies For <span style={{ color: "#ff6e6e" }}>FREE</span> */}
        </h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "800px",
          }}
        >
          <input
            ref={sessionIdRef}
            placeholder="Djinni sessionid (Devtools -> Application -> Cookies -> sessionid property value)"
          />
          <br />
          <input
            ref={categoryRef}
            placeholder="Get it from here https://djinni.co/jobs/keyword-javascript. Category is javascript"
          />
          <br />

          <input ref={messageRef} placeholder="Message" />
          <br />
          {loading && (
            <p style={{ color: "orangered" }}>
              Wait for some time, please. We are working hard to apply for you
              😓
            </p>
          )}
          {success && !loading && <p style={{ color: "green" }}>Success!</p>}
          <button disabled={loading} onClick={handleApply}>
            APPLY
          </button>
          <LogsList logs={logs} />
        </div>
      </main>

      <footer className={styles.footer}>
        <a href="https://djinni.co" target="_blank" rel="noopener noreferrer">
          <b>Powered by </b>
          <span className={styles.logo}>
            <Image
              src="/djinni.png"
              alt="Djinni banner"
              width={50}
              height={25}
            />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
