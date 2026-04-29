import sc1 from "../assets/Conference01Plant02.jpg.jpeg";
import sc2 from "../assets/Conference02Plant02.jpg.jpeg";
import aud from "../assets/BoardRoomPlant02.jpg.jpeg";
import tr from "../assets/trainingroomdee.jpg";

export const roomCategories = [
  {
    name: "Small Conference Rooms",
    count: 2,
    rooms: [
      { id: 1, name: "Small Conference-1", capacity: 10, image: sc1 },
      { id: 2, name: "Small Conference-2", capacity: 10, image: sc2 },
    ]
  },
  {
    name: "Board Room",
    count: 1,
    rooms: [
      { id: 3, name: "Board Room-1", capacity: 25, image: aud },
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