import sc1 from "../assets/smallrooms.jpg";
import sc2 from "../assets/smallconf2.jpg";
import aud from "../assets/auditorium.webp";
import tr from "../assets/trainingroom.jpg";

export const roomCategories = [
  {
    name: "Small Conference Rooms",
    count: 2,
    rooms: [
      { id: 1, name: "Small Conference-1", capacity: 20, image: sc1 },
      { id: 2, name: "Small Conference-2", capacity: 20, image: sc2 },
    ]
  },
  {
    name: "Auditorium",
    count: 1,
    rooms: [
      { id: 3, name: "Auditorium-1", capacity: 100, image: aud },
    ]
  },
  {
    name: "Training Room",
    count: 1,
    rooms: [
      { id: 4, name: "Training Room", capacity: 30, image: tr },
    ]
  }
];