import sc1 from "../assets/conference1dee.jpg";
import sc2 from "../assets/conferenceroom2dee.jpg";
import aud from "../assets/boardroomdee.jpg";
import tr from "../assets/trainingroomdee.jpg";

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
    name: "Board Room",
    count: 1,
    rooms: [
      { id: 3, name: "Board Room-1", capacity: 20, image: aud },
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