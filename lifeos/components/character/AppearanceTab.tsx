import React from 'react';
import { useGame } from '../../contexts/GameContext';

const AppearanceTab: React.FC = () => {
    const { 
        character, 
        updateCharacterAppearance,
        hairstyles, hairColors, eyeColors, skinTones,
        bodyTypes, faceShapes, eyeStyles, noseStyles, mouthStyles
    } = useGame();

    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div className="border-b border-border-color pb-4 mb-4">
            <h3 className="font-bold text-lg text-text-secondary mb-3">{title}</h3>
            {children}
        </div>
    );

    const OptionButton: React.FC<{ value: string; selectedValue: string; onSelect: () => void; children?: React.ReactNode, title?: string }> = 
    ({ value, selectedValue, onSelect, children, title }) => (
        <div className="text-center">
            <button
                onClick={onSelect}
                className={`w-full p-2 rounded-lg cursor-pointer border-2 aspect-square flex items-center justify-center
                            ${selectedValue === value ? 'border-accent bg-accent/20' : 'border-border-color bg-primary hover:border-accent/50'}`}
            >
                {children}
            </button>
            {title && <p className="text-xs mt-1 capitalize">{title}</p>}
        </div>
    );
    
    const ColorSwatch: React.FC<{ color: string; selectedColor: string; onSelect: () => void; }> = ({ color, selectedColor, onSelect }) => (
        <button
            onClick={onSelect}
            className={`w-10 h-10 rounded-full cursor-pointer border-2 transition-all
                        ${selectedColor === color ? 'border-accent scale-110' : 'border-transparent'}`}
            style={{ backgroundColor: color }}
        />
    );

    return (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <Section title="Body & Face">
                <div className="grid grid-cols-3 gap-4">
                     <OptionButton value={character.appearance.bodyType} selectedValue={character.appearance.bodyType} onSelect={() => {}}>
                        <div className="grid grid-cols-3 gap-2">
                            {bodyTypes.map(type => (
                                <button key={type} onClick={() => updateCharacterAppearance({ bodyType: type })} className={`p-1 rounded text-xs capitalize ${character.appearance.bodyType === type ? 'bg-accent' : 'bg-secondary'}`}>{type}</button>
                            ))}
                        </div>
                    </OptionButton>
                     <OptionButton value={character.appearance.faceShape} selectedValue={character.appearance.faceShape} onSelect={() => {}}>
                        <div className="grid grid-cols-3 gap-2">
                            {faceShapes.map(shape => (
                                <button key={shape} onClick={() => updateCharacterAppearance({ faceShape: shape })} className={`p-1 rounded text-xs capitalize ${character.appearance.faceShape === shape ? 'bg-accent' : 'bg-secondary'}`}>{shape}</button>
                            ))}
                        </div>
                    </OptionButton>
                </div>
            </Section>

            <Section title="Skin Tone">
                <div className="flex flex-wrap gap-3">
                    {skinTones.map(color => (
                        <ColorSwatch key={color} color={color} selectedColor={character.appearance.skinTone} onSelect={() => updateCharacterAppearance({ skinTone: color })} />
                    ))}
                </div>
            </Section>

            <Section title="Hair">
                 <div className="flex flex-wrap gap-3 mb-4">
                    {hairColors.map(color => (
                        <ColorSwatch key={color} color={color} selectedColor={character.appearance.hairColor} onSelect={() => updateCharacterAppearance({ hairColor: color })} />
                    ))}
                </div>
                <div className="grid grid-cols-4 gap-4">
                    {hairstyles.map(style => (
                        <OptionButton key={style} value={style} selectedValue={character.appearance.hairstyle} onSelect={() => updateCharacterAppearance({ hairstyle: style })} title={style}>
                            <div className="w-10 h-10 bg-gray-500 rounded-sm" />
                        </OptionButton>
                    ))}
                </div>
            </Section>
            
            <Section title="Facial Features">
                <p className="text-sm text-text-secondary mb-2">Eyes</p>
                 <div className="flex flex-wrap gap-3 mb-4">
                    {eyeColors.map(color => (
                        <ColorSwatch key={color} color={color} selectedColor={character.appearance.eyeColor} onSelect={() => updateCharacterAppearance({ eyeColor: color })} />
                    ))}
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    {eyeStyles.map(style => (
                        <OptionButton key={style} value={style} selectedValue={character.appearance.eyeStyle} onSelect={() => updateCharacterAppearance({ eyeStyle: style })} title={style}>
                            <div className="text-2xl">👁</div>
                        </OptionButton>
                    ))}
                </div>
                <p className="text-sm text-text-secondary mt-4 mb-2">Nose</p>
                 <div className="grid grid-cols-3 gap-4">
                    {noseStyles.map(style => (
                        <OptionButton key={style} value={style} selectedValue={character.appearance.noseStyle} onSelect={() => updateCharacterAppearance({ noseStyle: style })} title={style}>
                             <div className="text-2xl">👃</div>
                        </OptionButton>
                    ))}
                </div>
                 <p className="text-sm text-text-secondary mt-4 mb-2">Mouth</p>
                 <div className="grid grid-cols-3 gap-4">
                    {mouthStyles.map(style => (
                        <OptionButton key={style} value={style} selectedValue={character.appearance.mouthStyle} onSelect={() => updateCharacterAppearance({ mouthStyle: style })} title={style}>
                            <div className="text-2xl">👄</div>
                        </OptionButton>
                    ))}
                </div>
            </Section>
        </div>
    );
};

export default AppearanceTab;