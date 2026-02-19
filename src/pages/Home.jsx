import Navbar from "../components/Navbar"
import ComparisonPage from "../components/ComparisonPage"
import Footer from "../components/Footer"


const Home = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <ComparisonPage />

            {/* <PopularPicks onSelect={(car) => alert(`Selected: ${car.name}`)} /> */}
            <Footer />
        </div>

    )
}

export default Home