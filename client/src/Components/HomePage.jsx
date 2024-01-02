import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import ProfilePopup from "./ProfilePopup";
import "../css/general.css";
import "../css/style.css";

// Header component containing Navbar and profile icon
const Header = ({ navLinks, onProfileClick }) => (
  <header className="header flex">
    <Navbar links={navLinks} />
    <div className="profile-circle" onClick={onProfileClick}>
      <i className="ri-user-fill profile-icon"></i>
    </div>
  </header>
);

// MainContent component displaying hero section
const MainContent = ({ onExploreClick }) => (
  <main>
    <section className="section-hero">
      <div className="container grid grid--2-col .grid--center-v">
        <div className="hero-content-box">
          <h1 className="heading-primary">
            All you need is our delicious meals
          </h1>
          <p className="hero-description">
            We are the best in the town and always ready to serve you with
            absolutely the best quality meals
          </p>
          <button className="btn1 btn-hero" onClick={onExploreClick}>
            Explore Meals
          </button>
        </div>
      </div>
    </section>
  </main>
);

// Footer component displaying contact information
const Footer = () => (
  <footer className="footer">
    <div className="container grid-footer">
      <div className="footer--shop">
        <div className="shop">
          <p>Blessed Meals</p>
        </div>
        <p className="shop-text">
          What we can do? <br />
          Serving the best meals for you
        </p>
      </div>

      <div className="footer--contact">
        <p className="contact-title">Contact</p>
        <ul className="list">
          <ListItem
            iconClass="ri-mail-fill"
            linkClass="link-footer"
            linkText="blessedmeals@gmail.com"
          />
          <ListItem
            iconClass="ri-phone-fill"
            linkClass="link-footer"
            linkText="+447482878970"
          />
        </ul>
      </div>
    </div>
  </footer>
);

// ListItem component for displaying contact details
const ListItem = ({ iconClass, linkClass, linkText }) => (
  <li className="list-item">
    <i className={`${iconClass} icon-contact`}></i>
    <a className={linkClass}>{linkText}</a>
  </li>
);

// Homepage component
const Homepage = () => {
  const navigate = useNavigate();
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [userPreference, setUserPreference] = useState("");

  useEffect(() => {
    document.body.classList.add("custom-body-home");

    return () => {
      document.body.classList.remove("custom-body-home");
    };
  }, []);

  // Navigation links for the Navbar component
  const navLinks = [
    // Configuration for navigation links
    { label: "Home", to: "/homepage", active: true },
    { label: "Meals", to: "/meals", active: false },
    { label: "Favorites", to: "/favorites", active: false },
    { label: "Chat", to: "/chat", active: false },
  ];

  // Function to open profile popup
  const openPopup = () => setPopupOpen(true);

  // Function to close profile popup
  const closePopup = () => setPopupOpen(false);

  return (
    <div className="homepage">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
        <title>Meals Shop</title>
      </head>
      <body>
        <Header navLinks={navLinks} onProfileClick={openPopup} />
        <MainContent onExploreClick={() => navigate("/meals")} />
        <Footer />
        {isPopupOpen && (
          <ProfilePopup
            username={username}
            userPreference={userPreference}
            onClose={closePopup}
          />
        )}
      </body>
    </div>
  );
};

export default Homepage;
