import React, { useState, useEffect, useRef } from "react";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import "https://cdn.lordicon.com/lordicon.js";
import { useSelector, useDispatch } from "react-redux";
import WaveSurfer from "wavesurfer.js";
import "bootstrap/dist/css/bootstrap.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faA,
  faAt,
  faCopyright,
  faFileCirclePlus,
} from "@fortawesome/free-solid-svg-icons";

// Initialize the Regions plugin
const regions = RegionsPlugin.create();

const COLORS = [
  "#FF0000",
  "#FF69B4",
  "#FF8C00",
  "#FFD700",
  "#9ACD32",
  "#00FF00",
  "#008B00",
  "#006400",
  "#004500",
  "#00008B",
  "#0000CD",
  "#4169E1",
  "#8A2BE2",
  "#A52A2A",
  "#B22222",
  "#8B008B",
  "#800000",
  "#A9A9A9",
  "#808080",
  "#FFA500",
  "#FFFF00",
  "#00FFFF",
  "#0000FF",
  "#1E90FF",
];
let zoom = 200;
const DJFXSoundSystem = () => {
  const dispatch = useDispatch();
  const playerRef = useRef(null);

  // Use a loop to dynamically get button outlines
  const buttonOutlines = useSelector((state) =>
    Array.from({ length: 10 }, (_, i) => state[`buttonOutline${i + 1}`])
  );

  // Store uploaded files for each set in an array
  const [uploadedFilesSets, setUploadedFilesSets] = useState(
    Array.from({ length: 10 }, () => [])
  );

  const [wavesurfer, setWaveSurfer] = useState(null); // Store the WaveSurfer instance
  const [activeFile, setActiveFile] = useState(null); // Track currently playing file
  const waveformRef = useRef(null); // Reference to the waveform container
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Create a gradient for the wave color
  const createGradient = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1; // Set width to 1 for linear gradient
    canvas.height = 150; // Set height for the gradient

    const gradient = ctx.createLinearGradient(0, 0, 0, 150);
    gradient.addColorStop(0.6, "#0D92F4");
    gradient.addColorStop(0.7, "#4379F2");
    gradient.addColorStop(1, "#024CAA");

    return gradient;
  };

  // Initialize WaveSurfer when component mounts
  useEffect(() => {
    playerRef.current?.playFromBeginning();

    if (!wavesurfer && waveformRef.current) {
      const waveSurferInstance = WaveSurfer.create({
        progressColor: "#050C9C",
        cursorColor: "#CB80AB",
        cursorWidth: 2,
        dragToSeek: true,
        hideScrollbar: true,
        height: 200,
        responsive: true,
        autoScroll: true,
        audioRate: 1,
        mediaControls: true,
        waveColor: createGradient(), // Apply the gradient here
        container: waveformRef.current,
        plugins: [regions],
      });

      setWaveSurfer(waveSurferInstance);

      // Clean up function to destroy the WaveSurfer instance on unmount
      return () => {
        waveSurferInstance.destroy();
      };
    }
  }, [waveformRef]);
  const handleFileUpload = (e, setNumber) => {
    const file = e.target.files[0]; // Get the uploaded file
    if (file) {
      const audioUrl = URL.createObjectURL(file); // Create a URL for the audio file

      // Ensure that the uploaded file is not already in the state
      const uploadedFile = {
        file,
        audioUrl,
      };

      setUploadedFilesSets((prevSets) => {
        const updatedSet = [...prevSets]; // Copy the current sets
        if (!updatedSet[setNumber - 1]) updatedSet[setNumber - 1] = []; // Initialize the set if necessary

        // Check if the file is already uploaded
        const isFileExists = updatedSet[setNumber - 1].some(
          (item) => item.file.name === file.name
        );

        if (!isFileExists) {
          updatedSet[setNumber - 1].push(uploadedFile); // Add the new file to the appropriate set
        }

        return updatedSet; // Return the updated state
      });
    }
  };

  // Handle music playback and pause for individual files
  const playMusic = (index, file) => {
    if (wavesurfer) {
      // Stop any currently playing audio if it's a different file
      if (activeFile && activeFile.audioUrl !== file.audioUrl) {
        wavesurfer.stop();
      }

      // If the same file is clicked, toggle play/pause
      if (activeFile && activeFile.audioUrl === file.audioUrl) {
        wavesurfer.playPause();
      } else {
        // Load the new audio file into WaveSurfer and play it
        wavesurfer.load(file.audioUrl);
        setActiveFile(file);
        wavesurfer.on("ready", () => {
          wavesurfer.zoom(zoom);
          wavesurfer.play();
          wavesurfer.on("finish", () => wavesurfer.play());
        });
      }
    }
  };

  const triggerFileInput = (setNumber) => {
    document.getElementById(`audioUploadSet${setNumber}`).click(); // Trigger the hidden file input for specific set
  };

  const currentYear = new Date().getFullYear();
  return (
    <>
      <header>
        <nav className="navbar bg-body-tertiary sticky-top">
          <div className="container-fluid">
            <a className="navbar-brand" href="#">
              DJ FX Sound System
            </a>
          </div>
        </nav>
      </header>

      <main role="main" className="container-lg">
        <div className="d-flex flex-row-reverse">
          <div className="p-2">
            <div>
              <label>Zoom: </label>
              <input
                type="range"
                min="10"
                max="300"
                defaultValue={zoom}
                onChange={(e) => wavesurfer.zoom(e.target.valueAsNumber)}
              />
            </div>
          </div>
          <div className="p-2">
            <div>
              <label>Play Speed: </label>
              <input
                type="range"
                min="0.25"
                step="0.25"
                max="4"
                defaultValue="1"
                onChange={(e) => {
                  const speed = parseFloat(e.target.value);
                  setPlaybackSpeed(speed);
                  wavesurfer.setPlaybackRate(speed);
                }}
              />
              <p>Current Speed: {playbackSpeed}x</p>
            </div>
          </div>
        </div>

        <div
          ref={waveformRef}
          id="waveform"
          style={{ border: "1px dashed gray", borderRadius: 30 }}
        ></div>

        {uploadedFilesSets.map((uploadedFilesSet, setIndex) => (
          <>
            <div className="row mt-4" key={setIndex}>
              <div className="col-2">
                <div className="d-grid gap-2 col-6 mx-auto">
                  <input
                    type="file"
                    className="d-none"
                    accept="audio/*"
                    onChange={(e) => handleFileUpload(e, setIndex + 1)}
                    id={`audioUploadSet${setIndex + 1}`} // Unique ID for each set
                  />
                  <FontAwesomeIcon
                  title="Upload Auto File"
                    style={{
                      color: COLORS[setIndex],
                      width: 50,
                      height: 50,
                    }}
                    icon={faFileCirclePlus}
                    onClick={() => triggerFileInput(setIndex + 1)}
                  />
                </div>
              </div>

              {uploadedFilesSet.map((fileData, index) => (
                <div key={index} className="col-2 d-flex">
                  <button
                    style={
                      index === buttonOutlines[setIndex].index &&
                      buttonOutlines[setIndex].outline
                        ? {
                            border: "1px solid " + COLORS[setIndex],
                          }
                        : {
                            background: COLORS[setIndex],
                            border: "1px solid  " + COLORS[setIndex],
                          }
                    }
                    className={
                      index === buttonOutlines[setIndex].index &&
                      buttonOutlines[setIndex].outline
                        ? "btn btn-sm flex-fill my-1"
                        : "btn btn-sm flex-fill text-white my-1"
                    }
                    onClick={() => {
                      const currentOutlineState =
                        buttonOutlines[setIndex].index === index
                          ? !buttonOutlines[setIndex].outline
                          : true;
                      dispatch({
                        type: `toggleOutline${setIndex + 1}`,
                        index,
                        outline: currentOutlineState,
                      });
                      playMusic(index, fileData, setIndex + 1);
                    }}
                  >
                    {fileData.file.name}
                  </button>
                </div>
              ))}
            </div>
            <hr />
          </>
        ))}
      </main>

      <footer className="footer   bg-body-tertiary  sticky-bottom mt-5">
        <div className="container-fluid">
          <div class="row justify-content-around ">
            <div class="col-6 text-center">
              Copyright <FontAwesomeIcon icon={faCopyright} /> {currentYear}
            </div>
            <div class="col-6 text-center">
              Created by {' '}
              <a href="https://www.facebook.com/profile.php?id=100006745398153">
                John Cris Manabo
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default DJFXSoundSystem;
