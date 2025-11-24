export default function Gallery() {
  const galleryImages = [
    {
      id: 1,
      title: "Rock Concert Live",
      category: "Music",
      image: "/Images/gallery1.avif",
      description: "Live rock performance with thousands of fans",
    },
    {
      id: 2,
      title: "Tech Summit 2024",
      category: "Conference",
      image: "/Images/gallery2.avif",
      description: "Industry leaders sharing insights on technology",
    },
    {
      id: 3,
      title: "Jazz Evening",
      category: "Music",
      image: "/Images/gallery3.avif",
      description: "Elegant jazz performance in an intimate setting",
    },
    {
      id: 4,
      title: "Sports Championship",
      category: "Sports",
      image: "/Images/gallery4.jpg",
      description: "Exciting match between top teams",
    },
    {
      id: 5,
      title: "Theater Production",
      category: "Theater",
      image: "/Images/gallery5.png",
      description: "Award-winning theatrical performance",
    },
    {
      id: 6,
      title: "Festival Celebration",
      category: "Festival",
      image: "/Images/gallery2.avif",
      description: "Multi-day celebration with food, music, and fun",
    },
  ];

  return (
    <section id="gallery" className="bg-gray-50 py-20 px-4 md:px-8">
      <div className="max-w-screen-xl mx-auto">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Gallery
          </h2>
          <p className="text-lg text-gray-600">
            Experience the moments from our past events
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {galleryImages.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer bg-white"
            >
              {/* Image Container */}
              <div className="w-full h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-6xl overflow-hidden">
                {item.image.startsWith("/") ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {item.image}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
