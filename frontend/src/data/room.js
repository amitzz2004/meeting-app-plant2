import sc1 from "../assets/smallrooms.jpg";
import sc2 from "../assets/smallconf2.jpg";
import sc3 from "../assets/small2conf.jpg";
import sc4 from "../assets/smallconference4.jpg";
import bc1 from "../assets/bigrooms.webp";
import bc2 from "../assets/bigconference2.jpg";
import aud from "../assets/auditorium.webp";
import tr from "../assets/trainingroom.jpg";

export const roomCategories = [
  {
    name: "Small Conference Rooms",
    count: 4,
    rooms: [
      { id: 1, name: "Small Conference-1", capacity: 6, image: sc1 },
      { id: 2, name: "Small Conference-2", capacity: 6, image: sc2 },
      { id: 3, name: "Small Conference-3", capacity: 6, image: sc3 },
      { id: 4, name: "Small Conference-4", capacity: 6, image: sc4 },
    ]
  },
  {
    name: "Big Conference Rooms",
    count: 2,
    rooms: [
      { id: 5, name: "Big Conference-1", capacity: 20, image: bc1 },
      { id: 6, name: "Big Conference-2", capacity: 20, image: bc2 },
    ]
  },
  {
    name: "Auditorium",
    count: 1,
    rooms: [
      { id: 7, name: "Auditorium-1", capacity: 100, image: aud },
    ]
  },
  {
    name: "Training Room",
    count: 1,
    rooms: [
      { id: 8, name: "Training Room", capacity: 30, image: tr },
    ]
  }
];