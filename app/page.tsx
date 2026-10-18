import Countdown from "@/components/Countdown";
import { wedding } from "@/lib/config";

export default function Home() {
  return (
    <main className="hero">
      {/* eslint-disable @next/next/no-img-element */}
      <div className="top-flowers" />
      <img className="leaves left" src="/assets/SidePlant.png" alt="" />
      <img className="leaves right" src="/assets/SidePlant.png" alt="" />
      <img className="bushes left" src="/assets/Bushes.png" alt="" />
      <img className="bushes right" src="/assets/Bushes.png" alt="" />
      <img className="person groom" src="/assets/Groom.png" alt="Sourabh" />
      <img className="person bride" src="/assets/Bride.png" alt="Shradha" />

      <div className="invite">
        <p className="eyebrow">
          We cordially invite you to the
          <br />
          wedding ceremony of
        </p>
        <h1>
          <span>{wedding.bride}</span>
          <em>&amp;</em>
          <span>{wedding.groom}</span>
        </h1>
        <p className="when">{wedding.dateLabel}</p>
        <p className="where">
          {wedding.venue[0]}
          <br />
          {wedding.venue[1]}
        </p>
        <p>
          <a href={wedding.mapUrl} target="_blank" rel="noreferrer">
            View on map →
          </a>
        </p>
        <Countdown to={wedding.date} />
      </div>
    </main>
  );
}
