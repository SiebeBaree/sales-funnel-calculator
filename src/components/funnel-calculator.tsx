'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from './ui/button';
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, EditIcon, PlusIcon, SaveIcon, Trash2Icon } from 'lucide-react';
import { Label } from './ui/label';
import { toast } from 'sonner';

const pastelColors = [
    '#FFD1DC',
    '#BDEFFF',
    '#C7FFD8',
    '#E6E6FA',
    '#FFDAB9',
    '#BCF4DE',
    '#DCD0FF',
    '#FFB5B5',
    '#CCCCFF',
    '#DDF3B5',
];

export type FunnelStep = {
    name: string;
    conversionRate: number;
    value: number;
    isEditable?: boolean;
};

const LOCAL_STORAGE_KEY = 'funnel-calculator-data';
const INITIAL_LEADS = 1000;
const STEPS: FunnelStep[] = [
    { name: 'Initial leads', conversionRate: 100, value: INITIAL_LEADS, isEditable: false },
    { name: 'Qualified leads', conversionRate: 70, value: 700 },
    { name: 'Replied', conversionRate: 20, value: 140 },
    { name: 'Meetings booked', conversionRate: 20, value: 28 },
    { name: 'Meetings held', conversionRate: 70, value: 19.6 },
    { name: 'Closed/won', conversionRate: 30, value: 5.88 },
];

export default function FunnelCalculator() {
    const [isLoading, setIsLoading] = useState(true);
    const [intialLeads, setIntialLeads] = useState(INITIAL_LEADS);
    const [steps, setSteps] = useState<FunnelStep[]>(STEPS);
    const [isRainbowMode, setIsRainbowMode] = useState(false);

    function updateStep(index: number, conversionRate?: number, name?: string) {
        const newSteps = [...steps];
        if (conversionRate !== undefined) {
            if (conversionRate < 0) {
                toast.error('Conversion rate cannot be less than 0%');
                return;
            } else if (conversionRate > 100) {
                toast.error('Conversion rate cannot be more than 100%');
                return;
            }

            newSteps[index].conversionRate = conversionRate;
        }
        if (name !== undefined) {
            if (name.length > 50) {
                toast.error('Name cannot be more than 50 characters');
                return;
            }

            newSteps[index].name = name;
        }

        for (let i = index; i < newSteps.length; i++) {
            if (i === 0) {
                newSteps[i].value = intialLeads;
            } else {
                newSteps[i].value = (newSteps[i].conversionRate / 100) * newSteps[i - 1].value;
            }
        }

        setSteps(newSteps);
    }

    function deleteStep(index: number) {
        const newSteps = [...steps];
        newSteps.splice(index, 1);

        for (let i = index; i < newSteps.length; i++) {
            newSteps[i].value = (newSteps[i].conversionRate / 100) * newSteps[i - 1].value;
        }

        setSteps(newSteps);
    }

    function addStep() {
        const newSteps = [...steps];
        newSteps.push({
            name: `Step ${newSteps.length + 1}`,
            conversionRate: 100,
            value: newSteps[newSteps.length - 1].value,
        });
        setSteps(newSteps);
    }

    function switchStep(index: number, direction: 'up' | 'down') {
        if (index <= 1 && direction === 'up') return;
        if (index === steps.length - 1 && direction === 'down') return;

        const newSteps = [...steps];
        const temp = newSteps[index];
        newSteps[index] = newSteps[index + (direction === 'up' ? -1 : 1)];
        newSteps[index + (direction === 'up' ? -1 : 1)] = temp;

        for (let i = 1; i < newSteps.length; i++) {
            newSteps[i].value = (newSteps[i].conversionRate / 100) * newSteps[i - 1].value;
        }

        setSteps(newSteps);
    }

    function resetSteps() {
        setSteps(STEPS);
        setIntialLeads(INITIAL_LEADS);
    }

    function updateInitialLeads(value: number) {
        if (value < 0) {
            setIntialLeads(0);
            toast.error('You cannot contact a negative amount of prospects...');
        } else if (value > 999999) {
            setIntialLeads(999999);
            toast.error('Are you really contacting more than 1,000,000 prospects?');
        } else {
            setIntialLeads(value);
        }
    }

    useEffect(() => {
        const newSteps = [...steps];
        newSteps[0].value = intialLeads;

        for (let i = 1; i < newSteps.length; i++) {
            newSteps[i].value = (newSteps[i].conversionRate / 100) * newSteps[i - 1].value;
        }

        setSteps(newSteps);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [intialLeads]);

    useEffect(() => {
        const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedData) {
            const parsed: FunnelStep[] = JSON.parse(storedData);
            setIntialLeads(parsed[0].value);
            setSteps(parsed);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(steps));
        }
    }, [steps, isLoading]);

    return (
        <>
            <Card className="w-full max-w-3xl mx-auto">
                <CardContent>
                    <div className="flex justify-between items-center gap-4 mb-8">
                        <div className="flex flex-col gap-2">
                            <Label className="font-semibold">Initial leads</Label>
                            <Input
                                type="number"
                                className="w-40"
                                value={intialLeads}
                                onChange={(e) => updateInitialLeads(Number(e.target.value))}
                            />
                        </div>

                        <div className="flex flex-row items-center gap-2">
                            {steps.length < 20 && (
                                <Button onClick={() => addStep()}>
                                    <PlusIcon className="w-4 h-4" />
                                    Add step
                                </Button>
                            )}
                            <Button variant="destructive" onClick={() => resetSteps()}>
                                Reset
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        {steps.map((step, index) => (
                            <FunnelStepForm
                                key={index}
                                index={index}
                                total={steps.length + 1}
                                step={step}
                                updateStep={updateStep}
                                deleteStep={deleteStep}
                                switchStep={switchStep}
                                isRainbowMode={isRainbowMode}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end max-w-3xl mx-auto mt-2">
                <button className="hover:underline text-xs" onClick={() => setIsRainbowMode(!isRainbowMode)}>
                    {isRainbowMode ? 'Disable 🌈 mode' : 'Enable 🌈 mode'}
                </button>
            </div>
        </>
    );
}

type FunnelStepFormProps = {
    index: number;
    total: number;
    step: FunnelStep;
    isRainbowMode: boolean;
    updateStep: (index: number, conversionRate?: number, name?: string) => void;
    deleteStep: (index: number) => void;
    switchStep: (index: number, direction: 'up' | 'down') => void;
};

function FunnelStepForm({
    index,
    total,
    step,
    isRainbowMode,
    updateStep,
    deleteStep,
    switchStep,
}: FunnelStepFormProps) {
    function calculateFunnelWidth(index: number, totalSteps: number): number {
        const maxWidth = 100;
        const minWidth = 25;

        const decreasePerStep = (maxWidth - minWidth) / totalSteps;
        return maxWidth - decreasePerStep * index;
    }

    function getGradientColor(): string {
        const colors = pastelColors;
        const randomIndex1 = Math.floor(Math.random() * colors.length);
        let randomIndex2 = Math.floor(Math.random() * colors.length);
        while (randomIndex2 === randomIndex1) {
            randomIndex2 = Math.floor(Math.random() * colors.length);
        }

        return `linear-gradient(to right, ${colors[randomIndex1]}, ${colors[randomIndex2]})`;
    }

    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="flex items-center gap-4">
            <div className="flex-grow flex flex-row items-center justify-center">
                <div
                    className="gap-4 rounded-lg p-4 w-full h-20 relative group/card"
                    style={{
                        width: `${calculateFunnelWidth(index, total)}%`,
                        background: isRainbowMode ? getGradientColor() : pastelColors[index % 10],
                    }}
                >
                    {isEditing ? (
                        <div className="flex flex-col items-center">
                            <div className="flex flex-row items-center">
                                <input
                                    name="conversionRate"
                                    value={step.conversionRate}
                                    type="number"
                                    className="w-7 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    onChange={(e) => updateStep(index, Number(e.target.value))}
                                />
                                <p>%</p>
                            </div>
                            <input
                                name="stepName"
                                value={step.name}
                                onChange={(e) => updateStep(index, undefined, e.target.value)}
                                className="w-full max-w-56 text-center"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <p>{step.conversionRate}%</p>
                            <p>{step.name}</p>
                        </div>
                    )}

                    {isEditing ? (
                        <div className="absolute top-1 right-2">
                            <div className="flex flex-col items-center">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="bg-card"
                                    onClick={() => setIsEditing(false)}
                                >
                                    <SaveIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        step.isEditable !== false && (
                            <>
                                <div className="absolute top-1/2 -translate-y-1/2 left-2 group-hover/card:opacity-100 opacity-0 transition-opacity">
                                    <div className="flex flex-col items-center gap-1">
                                        {index > 1 ? (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="bg-card"
                                                onClick={() => switchStep(index, 'up')}
                                            >
                                                <ArrowUpIcon className="w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <div className="w-8 h-8" />
                                        )}
                                        {index < total - 2 ? (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="bg-card"
                                                onClick={() => switchStep(index, 'down')}
                                            >
                                                <ArrowDownIcon className="w-4 h-4" />
                                            </Button>
                                        ) : (
                                            <div className="w-8 h-8" />
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-1/2 -translate-y-1/2 right-2 group-hover/card:opacity-100 opacity-0 transition-opacity">
                                    <div className="flex flex-col items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="bg-card"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="bg-card hover:bg-red-500 group/delete"
                                            onClick={() => deleteStep(index)}
                                        >
                                            <Trash2Icon className="w-4 h-4 text-red-500 group-hover/delete:text-white transition-colors" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )
                    )}
                </div>
            </div>

            <div className="flex flex-row items-center min-w-20 max-w-20">
                <ArrowRightIcon className="w-4 h-4 mr-2" />
                <p>{step.value.toFixed(0)}</p>
            </div>
        </div>
    );
}
