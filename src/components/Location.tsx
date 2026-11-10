import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

// Just enough of the Google Maps types for the calls made below.
type Ctor = new (...args: unknown[]) => unknown
type MapsWindow = Window & {
  google?: { maps: { Map: Ctor; Circle: Ctor; Marker: Ctor; Size: Ctor; Point: Ctor } }
}

const Location = () => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mapsWindow = window as MapsWindow
    // Initialize Google Maps
    const initMap = () => {
      const google = mapsWindow.google
      if (google && mapRef.current) {
        // General area only, deliberately offset; never put the exact address in code
        const generalArea = { lat: 46.5600, lng: -87.5440 }
        
        const map = new google.maps.Map(mapRef.current, {
          center: generalArea,
          zoom: 10.5, // Slightly more zoomed in for better area visibility
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        })

        // Add a general area circle instead of exact marker
        new google.maps.Circle({
          strokeColor: '#be3400',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#be3400',
          fillOpacity: 0.1,
          map: map,
          center: generalArea,
          radius: 5000, // 5km radius (reduced from 8km)
        })

        // Add a tent marker in the center of the general area
        new google.maps.Marker({
          position: generalArea,
          map: map,
          title: "Northern Oasis Camping - General Area",
          icon: {
            url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="20" fill="#be3400" opacity="0.9"/>
                <path d="M8 28L20 12L32 28H28L26 26H14L12 28H8Z" fill="white"/>
                <path d="M16 26H24V28H16V26Z" fill="#be3400"/>
                <path d="M18 24H22V26H18V24Z" fill="#be3400"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          }
        })
      }
    }

    // For now, let's create a fallback map display without Google Maps API
    const createFallbackMap = () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="
            width: 100%; 
            height: 100%; 
            background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: #666;
            font-family: inherit;
          ">
            <div style="
              width: 80px; 
              height: 80px; 
              background: #be3400; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              margin-bottom: 1rem;
              opacity: 0.8;
            ">
              <span style="color: white; font-size: 2rem;"></span>
            </div>
            <h3 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">Marquette/Negaunee Area</h3>
            <p style="margin: 0; text-align: center; max-width: 200px;">
              Located between Marquette and Negaunee<br>
              Michigan's Upper Peninsula
            </p>
          </div>
        `
      }
    }

    // Try to load Google Maps, fallback to static display if API key is missing
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      createFallbackMap()
    } else if (!mapsWindow.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`
      script.async = true
      script.defer = true
      script.onload = initMap
      script.onerror = createFallbackMap
      document.head.appendChild(script)
      
      // Fallback if script doesn't load within 3 seconds
      setTimeout(() => {
        if (!mapsWindow.google) {
          createFallbackMap()
        }
      }, 3000)
    } else {
      initMap()
    }
  }, [])

  return (
    <section id="location" className="location">
      <div className="location-container">
        <div className="location-content">
          <div className="location-info">
            <h2>Find Your Perfect Escape</h2>
            <p>Located in the heart of nature, Northern Oasis Camping offers the perfect balance of seclusion and accessibility. 
               For privacy and security, we show only the general area on our map.</p>
            
            <div className="location-details">
              <div className="detail-item">
                <h3>📍 Location</h3>
                <p>Our property is located between Marquette and Negaunee, in Michigan's Upper Peninsula. We are 7 miles from downtown Marquette, 8 miles from the shores of beautiful Lake Superior and 53 miles from Pictured Rocks National Park. We are about 4 miles off of US 41 nestled in a quiet forest like setting.</p>
              </div>
            </div>
            
            <div className="location-actions">
              <Link to="/#contact" className="location-btn primary">
                Contact for Directions
              </Link>
            </div>
            
            <div className="privacy-notice">
              <p><small>📍 For privacy and security, exact location details are provided only after booking confirmation.</small></p>
            </div>
          </div>
          
          <div className="map-container">
            <div ref={mapRef} className="map"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Location 