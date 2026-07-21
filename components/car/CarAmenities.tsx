// components/car/CarAmenities.tsx
interface Amenity {
  icon: string
  title: string
  description: string
}

interface CarAmenitiesProps {
  amenities: Amenity[]
}

export function CarAmenities({ amenities }: CarAmenitiesProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-900">Premium Amenities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {amenities.map((item, index) => (
          <div
            key={index}
            className="p-6 border border-gray-200 rounded-xl space-y-3 hover:border-gray-900 transition"
          >
            <span className="text-3xl">{item.icon}</span>
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}