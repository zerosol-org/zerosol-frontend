import React, { useState } from "react";
import SecondCar from "../assets/second-car.png"
import FirstCar from "../assets/first-car.png"

const makes = {
  Tesla: ["Model S", "Model 3", "Model X", "Model Y"],
  BMW: ["X3", "X5", "M3"],
  Toyota: ["Corolla", "Camry", "RAV4"],
};

const CarCard = ({ title, image, car, setCar }) => {
  return (
    <div className="w-full max-w-md rounded-xl border bg-white shadow-sm overflow-visible">
      {/* Image wrapper */}
      <div className="relative bg-purple-500 rounded-t-xl h-32">
        <img
          src={image}
          alt={title}
          className="
            absolute
            left-1/2
            -translate-x-1/2
            top-[1rem]
            w-[20rem]
            object-contain
            drop-shadow-lg
          "
        />
      </div>

      {/* Content */}
      <div className="p-5 pt-16 space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Make
          </label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={car.make}
            onChange={(e) =>
              setCar({ make: e.target.value, model: "" })
            }
          >
            <option value="">Choose a make</option>
            {Object.keys(makes).map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Model
          </label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={car.model}
            disabled={!car.make}
            onChange={(e) =>
              setCar({ ...car, model: e.target.value })
            }
          >
            <option value="">Choose a model</option>
            {car.make &&
              makes[car.make].map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
};


const CarComparison = () => {
  const [firstCar, setFirstCar] = useState({ make: "", model: "" });
  const [secondCar, setSecondCar] = useState({ make: "", model: "" });

  const canCompare =
    firstCar.make &&
    firstCar.model &&
    secondCar.make &&
    secondCar.model;

  return (
    <div className="relative max-w-6xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CarCard
          title="Add first car"
          image={FirstCar}
          car={firstCar}
          setCar={setFirstCar}
        />

        <CarCard
          title="Add second car"
          image={SecondCar}
          car={secondCar}
          setCar={setSecondCar}
        />
      </div>

      {/* Compare button */}
      <div className="mt-8">
        <button
          disabled={!canCompare}
          className={`px-6 py-3 float-right rounded-full text-sm font-semibold shadow-lg transition
            ${
              canCompare
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          onClick={() =>
            console.log("Compare:", firstCar, secondCar)
          }
        >
          See the comparison
        </button>
      </div>
    </div>
  );
};

export default CarComparison;
