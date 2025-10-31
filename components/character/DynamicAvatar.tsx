import React from 'react';
import { Character } from '../../types';

interface DynamicAvatarProps {
  appearance: Character['appearance'];
  equipment?: Character['equipment'];
}

// --- SVG Path Data for different features ---
// A real app would have much more complex paths
const SVG_PARTS = {
    body: {
        slim: "M 40 90 C 40 70, 60 70, 60 90 H 40 Z",
        athletic: "M 35 90 C 35 65, 65 65, 65 90 H 35 Z",
        heavy: "M 30 90 C 30 60, 70 60, 70 90 H 30 Z",
    },
    face: {
        round: { cx: "50", cy: "50", rx: "25", ry: "25" },
        oval: { cx: "50", cy: "50", rx: "22", ry: "26" },
        square: { x: "28", y: "28", width: "44", height: "44", rx:"5" },
    },
    hair: {
        short01: <path d="M 25 30 Q 50 15, 75 30 L 75 40 Q 50 30, 25 40 Z" />,
        long01: <path d="M 25 30 Q 50 15, 75 30 L 80 60 Q 50 50, 20 60 Z" />,
        pony01: <path d="M 25 30 Q 50 15, 75 30 L 75 40 Q 50 30, 25 40 Z M 75 45 L 85 70 L 70 70 Z" />,
        spiky01: <path d="M 25 35 L 35 25 L 45 35 L 55 25 L 65 35 L 75 25 L 75 40 Q 50 35, 25 40 Z" />,
    },
    eyes: {
        standard: <><circle cx="40" cy="45" r="3" /><circle cx="60" cy="45" r="3" /></>,
        narrow: <><rect x="37" y="43" width="6" height="3" /><rect x="57" y="43" width="6" height="3" /></>,
        wide: <><circle cx="38" cy="45" r="4" /><circle cx="62" cy="45" r="4" /></>,
    },
    nose: {
        standard: <path d="M 50 50 L 48 58 L 52 58 Z" />,
        wide: <path d="M 50 50 L 46 60 L 54 60 Z" />,
        pointy: <path d="M 50 50 L 50 60 L 52 58 Z" />,
    },
    mouth: {
        smile: <path d="M 40 65 Q 50 72, 60 65" fill="none" stroke="black" strokeWidth="2" />,
        neutral: <path d="M 40 68 L 60 68" fill="none" stroke="black" strokeWidth="2" />,
        frown: <path d="M 40 70 Q 50 63, 60 70" fill="none" stroke="black" strokeWidth="2" />,
    },
    gear: {
        head: {
            gear2: <path d="M 25 25 C 25 10, 75 10, 75 25 L 78 40 L 22 40 Z" fill="#c0c0c0" stroke="#808080" strokeWidth="1" />, // Iron Helmet
        },
        torso: {
            gear3: <path d="M 35 65 L 25 95 H 75 L 65 65 Z" fill="#9370DB" stroke="#4B0082" strokeWidth="1" />, // Scholar's Robes
        }
    }
};

const DynamicAvatar: React.FC<DynamicAvatarProps> = ({ appearance, equipment }) => {
    // Fallbacks for safety
    const bodyPath = SVG_PARTS.body[appearance.bodyType as keyof typeof SVG_PARTS.body] || SVG_PARTS.body.athletic;
    const faceShape = SVG_PARTS.face[appearance.faceShape as keyof typeof SVG_PARTS.face] || SVG_PARTS.face.oval;
    const hairStyle = SVG_PARTS.hair[appearance.hairstyle as keyof typeof SVG_PARTS.hair] || SVG_PARTS.hair.short01;
    const eyeStyle = SVG_PARTS.eyes[appearance.eyeStyle as keyof typeof SVG_PARTS.eyes] || SVG_PARTS.eyes.standard;
    const noseStyle = SVG_PARTS.nose[appearance.noseStyle as keyof typeof SVG_PARTS.nose] || SVG_PARTS.nose.standard;
    const mouthStyle = SVG_PARTS.mouth[appearance.mouthStyle as keyof typeof SVG_PARTS.mouth] || SVG_PARTS.mouth.smile;

    const equippedHead = equipment?.head ? SVG_PARTS.gear.head[equipment.head as keyof typeof SVG_PARTS.gear.head] : null;
    const equippedTorso = equipment?.torso ? SVG_PARTS.gear.torso[equipment.torso as keyof typeof SVG_PARTS.gear.torso] : null;

    return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            {/* Body */}
            <path d={bodyPath} fill={appearance.skinTone} />
            {equippedTorso}
            
            {/* Head */}
            {faceShape.rx ? 
                <ellipse {...faceShape} fill={appearance.skinTone} /> :
                <rect {...faceShape} fill={appearance.skinTone} />
            }
            
            {/* Facial Features Group */}
            <g>
                {/* Eyes */}
                {React.cloneElement(eyeStyle, { fill: appearance.eyeColor })}
                
                {/* Nose */}
                {React.cloneElement(noseStyle, { fill: "#00000050" })}
                
                {/* Mouth */}
                {mouthStyle}
            </g>

            {/* Hair (conditionally rendered under helmet) */}
            {!equippedHead && React.cloneElement(hairStyle, { fill: appearance.hairColor })}

            {/* Head Gear */}
            {equippedHead}
        </svg>
    );
};

export default DynamicAvatar;