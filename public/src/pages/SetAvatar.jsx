import React, { useState, useEffect } from "react";
import { Buffer } from "buffer";

import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { setAvatarRoute } from "../utils/APIRoutes";
window.Buffer = Buffer;

const SetAvatar = () => {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);

  const showToast = (msg) => {
    toast.error(msg, {
      position: "bottom-right",
      autoClose: 8000,
      pauseOnHover: true,
      draggable: true,
      theme: "dark",
    });
  };

  useEffect(() => {
    if (!localStorage.getItem(process.env.REACT_APP_CHAT_APP_USER)) {
      navigate("/login");
    } else {
      const user = JSON.parse(
        localStorage.getItem(process.env.REACT_APP_CHAT_APP_USER)
      );
      if (user.isAvatarImageSet) navigate("/");
    }
  }, []); // eslint-disable-line

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      showToast("Please select an avatar");
    } else {
      const user = JSON.parse(
        localStorage.getItem(process.env.REACT_APP_CHAT_APP_USER)
      );
      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatars[selectedAvatar],
      });

      if (data.isSet) {
        user.isAvatarImageSet = true;
        user.avatarImage = data.image;
        localStorage.setItem(
          process.env.REACT_APP_CHAT_APP_USER,
          JSON.stringify(user)
        );
        navigate("/");
      } else {
        showToast("Error setting avatar. Please try again");
      }
    }
  };

  const fetchAvatars = async () => {
    setIsLoading(true);
    const data = [];

    for (let i = 0; i < 4; i++) {
      const seed = Math.floor(Math.random() * 1000000);
      const url = `https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`;
      const res = await fetch(url);
      const svg = await res.text();
      const base64 = Buffer.from(svg, 'utf-8').toString('base64');


      data.push(`data:image/svg+xml;base64,${base64}`);
    }

    setAvatars(data);
    setSelectedAvatar(undefined);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAvatars();
  }, []);

  return (
    <>
      {isLoading ? (
        <Container>
          <img src={loader} alt="Loading..." className="loader" />
        </Container>
      ) : (
        <Container>
          <div className="title-container">
            <h1>Pick an avatar as your profile picture</h1>
          </div>

          <div className="avatars">
            {avatars.map((avatar, i) => (
              <div
                key={i}
                className={`avatar ${selectedAvatar === i ? "selected" : ""}`}
              >
                <img
                  src={avatar}
                  alt={`Avatar ${i + 1}`}
                  onClick={() => setSelectedAvatar(i)}
                />
              </div>
            ))}
          </div>

          <div className="btn-container">
            <button className="submit-btn" onClick={setProfilePicture}>
              Set as Profile Picture
            </button>
            <button
              className="reload-btn"
              onClick={fetchAvatars}
              title="Load New Avatars"
            >
              🔄
            </button>
          </div>
        </Container>
      )}
      <ToastContainer />
    </>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  background-color: #131324;
  height: 100vh;
  width: 100vw;
  .loader {
    max-inline-size: 100%;
  }

  .title-container {
    h1 {
      color: #fff;
    }
  }

  .avatars {
    display: flex;
    gap: 2rem;

    .avatar {
      border: 0.4rem solid transparent;
      padding: 0.4rem;
      border-radius: 5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: 0.5s ease-in-out;

      img {
        height: 6rem;
        cursor: pointer;
      }
    }

    .selected {
      border: 0.4rem solid #4e0eff;
    }
  }

  .btn-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;

    .submit-btn,
    .reload-btn {
      background-color: #4e0eff;
      color: #fff;
      padding: 1rem 2rem;
      border: none;
      font-weight: bold;
      cursor: pointer;
      border-radius: 0.4rem;
      font-size: 1rem;
      text-transform: uppercase;
      transition: 0.2s ease-in-out;

      &:hover {
        background-color: #997af0;
      }
    }
  }
`;

export default SetAvatar;
