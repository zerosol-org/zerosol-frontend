// src/components/ComparisonPage.jsx
import { useState } from "react"
import ComparisonHeader from "./ComparisonHeader"
import ComparisonPeriod from "./ComparisonPeriod"
import ComparisonCard from "./ComparisonCard"
import AddVehicleModal from "./AddVehicleModal"
import ComparisonSpecs from "./ComparisonSpecs"

export default function ComparisonPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeSlot, setActiveSlot] = useState(null)
  const [years, setYears] = useState(3)

  const [firstCar, setFirstCar] = useState(null)
  const [secondCar, setSecondCar] = useState(null)

  const resetComparison = () => {
    setFirstCar(null)
    setSecondCar(null)
    setYears(3)
  }

  const openModalFor = (slot) => {
    setActiveSlot(slot)
    setModalOpen(true)
  }

  const handleSelectCar = (car) => {
    activeSlot === "first"
      ? setFirstCar(car)
      : setSecondCar(car)

    setModalOpen(false)
    setActiveSlot(null)
  }

  const handleRemoveFirst = () => setFirstCar(null)
  const handleRemoveSecond = () => setSecondCar(null)

  return (
    <>
      <ComparisonHeader
        firstCar={firstCar}
        secondCar={secondCar}
        onAddFirst={() => openModalFor("first")}
        onAddSecond={() => openModalFor("second")}
        onRemoveFirst={handleRemoveFirst}
        onRemoveSecond={handleRemoveSecond}
      />

      <ComparisonPeriod years={years} setYears={setYears} />

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <ComparisonCard
          key={`first-${years}-${firstCar?.id || 'empty'}`}
          car={firstCar}
          placeholder="First Car"
          onAdd={() => openModalFor("first")}
          variant="primary"
          years={years}
        />

        <ComparisonCard
          key={`second-${years}-${secondCar?.id || 'empty'}`}
          car={secondCar}
          placeholder="Second Car"
          onAdd={() => openModalFor("second")}
          variant="secondary"
          years={years}
        />
      </main>

      <ComparisonSpecs
        key={`specs-${years}-${firstCar?.id || 'empty'}-${secondCar?.id || 'empty'}`}
        leftCar={firstCar}
        rightCar={secondCar}
        onReset={resetComparison}
        years={years}
      />

      <AddVehicleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelectCar={handleSelectCar}
      />
    </>
  )
}