import React, { useEffect, useState } from "react";

export function Timer({ fiveMinutesFromNow }) {
    const calculateTimeLeft = () => {
        const difference = + fiveMinutesFromNow - +new Date();
        let timeLeft = {};

        if (difference > 0) {
        timeLeft = {
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60)
        };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        setTimeout(() => {
        setTimeLeft(calculateTimeLeft());
        }, 1000);
    });

    const timerComponents = [];

    Object.keys(timeLeft).forEach(interval => {
        timerComponents.push(
        <span className="ml-2" key={interval}>
            {timeLeft[interval]} {interval}
        </span>
        );
    });

    return (timerComponents.length ? timerComponents : <span>Time's up!</span>);
}