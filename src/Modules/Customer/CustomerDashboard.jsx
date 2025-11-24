import React from "react";
import HeroSection from "../../Components/HeroSection";
import Events from "./Events";
import Gallery from "./Gallery";
import ContactUs from "./contactus";
import Footer from "../../Components/Footer";

const CustomerDashboard = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <Events />
      <Gallery />
      <ContactUs />
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
