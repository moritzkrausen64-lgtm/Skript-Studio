import { Composition } from "remotion";
import { GenAnim21780643410350 } from "./compositions/GenAnim21780643410350";
import { GenAnim11780643405070 } from "./compositions/GenAnim11780643405070";
import { GenAnim01780643331302 } from "./compositions/GenAnim01780643331302";
import { GenAnim01780643248054 } from "./compositions/GenAnim01780643248054";
import { GenAnim01780643071070 } from "./compositions/GenAnim01780643071070";
import { GenAnim01780642977134 } from "./compositions/GenAnim01780642977134";
import { TextCard } from "./compositions/TextCard";
import { StatCard } from "./compositions/StatCard";
import { BodyMarker } from "./compositions/BodyMarker";
import { HeartPump } from "./compositions/HeartPump";
import { Mitochondria } from "./compositions/Mitochondria";
import { KneeJoint } from "./compositions/KneeJoint";
import { OrganAnim } from "./compositions/OrganAnim";

export function RemotionRoot() {
  return (
    <>
      {/* Skript-Overlays */}
      <Composition id="TextCard" component={TextCard} durationInFrames={90} fps={30} width={1080} height={1920}
        defaultProps={{ kicker: "EINBLENDUNG", headline: "Headline Text", sub: "" }} />
      <Composition id="StatCard" component={StatCard} durationInFrames={90} fps={30} width={1080} height={1920}
        defaultProps={{ kicker: "FAKT", value: "70", unit: "%", label: "", bars: [] }} />
      <Composition id="BodyMarker" component={BodyMarker} durationInFrames={120} fps={30} width={1080} height={1920}
        defaultProps={{ kicker: "REGION", label: "Herz", region: "Herz" }} />

      {/* Animations-Bibliothek — einfache Kompositionen */}
      <Composition id="HeartPump" component={HeartPump} durationInFrames={90} fps={30} width={1080} height={1920}
        defaultProps={{ bpm: 72, label: "HERZFREQUENZ" }} />
      <Composition id="Mitochondria" component={Mitochondria} durationInFrames={90} fps={30} width={1080} height={1920}
        defaultProps={{ label: "MITOCHONDRIEN" }} />
      <Composition id="KneeJoint" component={KneeJoint} durationInFrames={120} fps={30} width={1080} height={1920}
        defaultProps={{ label: "KNIEGELENK", speed: 1 }} />

      {/* Animations-Bibliothek — OrganAnim (detaillierte SVG-Assets) */}
      <Composition id="OrganHeart" component={OrganAnim} durationInFrames={150} fps={30} width={1080} height={1920}
        defaultProps={{ organ: "heart", label: "HERZ", kicker: "ANATOMIE" }} />
      <Composition id="OrganLung" component={OrganAnim} durationInFrames={150} fps={30} width={1080} height={1920}
        defaultProps={{ organ: "lung", label: "LUNGE", kicker: "ANATOMIE" }} />
      <Composition id="OrganMuscle" component={OrganAnim} durationInFrames={150} fps={30} width={1080} height={1920}
        defaultProps={{ organ: "muscle", label: "MUSKELFASER", kicker: "ANATOMIE" }} />
      <Composition id="GenAnim01780642977134" component={GenAnim01780642977134} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ format: "9:16", position: "bottom" }} />
      <Composition id="GenAnim01780643071070" component={GenAnim01780643071070} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ format: "9:16", position: "bottom" }} />
      <Composition id="GenAnim01780643248054" component={GenAnim01780643248054} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ format: "9:16", position: "bottom" }} />
      <Composition id="GenAnim01780643331302" component={GenAnim01780643331302} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ format: "9:16", position: "bottom" }} />
      <Composition id="GenAnim11780643405070" component={GenAnim11780643405070} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ format: "9:16", position: "bottom" }} />
      <Composition id="GenAnim21780643410350" component={GenAnim21780643410350} durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={{ format: "9:16", position: "bottom" }} />
    </>
  );
}
