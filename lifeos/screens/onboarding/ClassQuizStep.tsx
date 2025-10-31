import React, { useState } from 'react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

interface Props {
  onNext: () => void;
}

const questions = [
    {
        question: "When faced with a complex problem, your first instinct is to:",
        answers: ["Break it down and create a step-by-step plan.", "Experiment with different approaches immediately.", "Consult with others for their perspectives."]
    },
    {
        question: "You feel most accomplished when you:",
        answers: ["Complete a long-term project meticulously.", "Overcome a difficult, short-term challenge.", "Help someone else achieve their goal."]
    }
];

const classes = ["Strategist", "Warrior", "Diplomat"];

const ClassQuizStep: React.FC<Props> = ({ onNext }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [result, setResult] = useState<string | null>(null);

    const handleAnswer = (answerIndex: number) => {
        const newAnswers = [...answers, answerIndex];
        setAnswers(newAnswers);

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            // Simple logic: determine class by sum of answer indices
            const sum = newAnswers.reduce((a, b) => a + b, 0);
            const classIndex = sum % classes.length;
            setResult(classes[classIndex]);
        }
    }

    if(result) {
        return (
            <Card title="Your Path is Chosen" className="text-center animate-fade-in">
                <p className="text-text-secondary mb-4">Based on your answers, your recommended starting class is:</p>
                <h2 className="font-display text-4xl text-accent mb-8">{result}</h2>
                <p className="text-text-secondary mb-6">This will grant you starting bonuses to skills related to your class.</p>
                <Button onClick={onNext} className="w-full">Accept and Continue</Button>
            </Card>
        )
    }

    return (
        <Card title={`Question ${currentQuestion + 1}/${questions.length}`} className="animate-fade-in">
            <h3 className="text-xl text-text-main mb-6 text-center">{questions[currentQuestion].question}</h3>
            <div className="space-y-4">
                {questions[currentQuestion].answers.map((answer, index) => (
                    <button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        className="w-full text-left p-4 bg-primary border border-border-color rounded-lg hover:bg-accent hover:text-white transition-colors duration-200"
                    >
                        {answer}
                    </button>
                ))}
            </div>
        </Card>
    );
};

export default ClassQuizStep;
