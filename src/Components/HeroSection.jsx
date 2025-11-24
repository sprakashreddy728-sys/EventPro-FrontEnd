import { useState, useEffect } from "react";

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // You can add your image paths here
  const backgroundImages = [
    "/Images/image1.jpg",
    "/Images/image2.jpg",
    "/Images/image3.jpg",
    "/Images/image4.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000); // Change image every 2 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  return (
    <section
      id="home"
      className="relative w-full h-[85vh] overflow-hidden mt-20 pt-16"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImages[currentImageIndex]})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 0.5s ease-in-out",
      }}
    >
      {/* Optional: Add content overlay */}
      <div className="absolute inset-0 flex items-center justify-center px-6 md:px-12 lg:px-20">
        <div className="text-center text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome to Event Booking</h1>
          <p className="text-xl">Find and book the best events near you</p>
        </div>
      </div>

      {/* Image indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {backgroundImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentImageIndex ? "bg-red-500 w-8" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
