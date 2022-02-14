import React, { Component, Suspense } from 'react';
import FrameList from '../game/FrameList'
import '../App.css';

class Manager extends Component {

    constructor() {
        super();
        this.state = {
            started: false,
            roll: 0,
            turn: 1,
            frame: 1,
            frames: [],
            totalScore: 0,
            gameOver: false

        };
        this.handleStart = this.handleStart.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleRoll = this.handleRoll.bind(this);
    }

    maxFrames = 10;

    newFrame() {
        return {
            roll1: 0,
            roll2: 0,
            roll3: 0,
            frame: 0,
            id: 0,
            score: 0,
            runningScore: "",
            spare: false,
            strike: false,
            closed: false,
        };
    }

    nextFrame(newFrameNumber) {
        let newFrame = this.newFrame();
        newFrame.id = newFrameNumber;
        newFrame.frame = newFrameNumber;
        return newFrame;
    }

    start() {
        let newFrames = this.state.frames;
        for (let i = 1; i <= this.maxFrames; i++) {
            let newFrame = this.newFrame();
            newFrame.id = i;
            newFrame.frame = i;
            newFrames.push(newFrame);
        }
        
        this.setState({
            turn: 1,
            frame: 1,
            frames: newFrames,
            started: true
        });
    }

    calculateScore(newFrames, frameIndex, spare, strike) {
        let currentScore = 0;
        let nextRoll = 0;
        let lastFrame = frameIndex + 1 === this.maxFrames;

        currentScore += newFrames[frameIndex].roll1;
        currentScore += newFrames[frameIndex].roll2;

        if (strike) {
            try {
                if (lastFrame) {
                    nextRoll = newFrames[frameIndex].roll2;
                    console.log(nextRoll);
                } else {
                    nextRoll = newFrames[frameIndex + 1].roll1;
                    currentScore += nextRoll;
                }
            } catch {
                console.log(frameIndex + " threw an error on strike");
                currentScore += 0;
            }
            try {
                if (!lastFrame && nextRoll < 10) {
                    currentScore += newFrames[frameIndex + 1].roll2;
                } else {
                    if (lastFrame) {
                        currentScore += newFrames[frameIndex].roll3;
                    } else if (frameIndex === this.maxFrames - 2) {
                        currentScore += newFrames[frameIndex + 1].roll2;
                    } else {
                        currentScore += newFrames[frameIndex + 2].roll1;
                    }
                }
            } catch {
                currentScore += 0;
            }
        } else if (spare) {
            try {
                if (lastFrame) {
                    nextRoll = newFrames[frameIndex].roll3;
                } else {
                    nextRoll = newFrames[frameIndex + 1].roll1;
                }
                currentScore += nextRoll;
            } catch { currentScore += 0; }
        }

        return currentScore;
    }

    setupNextTurn(newFrames, advanceFrame, nextTurn) {
        let nextFrame = this.state.frame;

        //On the last frame but should advance
        if (this.state.frame === this.maxFrames && advanceFrame) {
            if (nextTurn < 2 && newFrames[nextFrame - 1].strike) {
                newFrames[nextFrame - 1].closed = true;
                nextTurn += 1;
            }
        } else if (advanceFrame) {
            newFrames[nextFrame - 1].closed = true;
            nextFrame = Math.min(this.state.frame + 1, this.maxFrames);
        }

        this.setState({
            frames: newFrames,
            frame: nextFrame,
            turn: nextTurn
        });
    }

    updateScore() {
        let newTotalScore = 0;
        let newFrames = this.state.frames;
        newFrames.forEach((frame) => {
            frame.score = this.calculateScore(newFrames, frame.frame - 1, frame.spare, frame.strike);
            newTotalScore += frame.score;
     
            frame.runningScore = frame.closed ? newTotalScore : "";
        })

        this.setState({
            frames: newFrames,
            totalScore: newTotalScore
        });
    }


    handleStart(e) {
        this.start();
    }

    handleChange(e) {
        const { id, value } = e.target;
        let newValue = 0;
        try {
            newValue = parseInt(value);
            if (value < 0) {
                newValue = 0;
            }

            if (value > 10) {
                newValue = 10;
            }
        } catch (error) {
            //This would mean a number failed to parse, count the score as missed or 0 pins
            console.log(error)
        }

        this.setState({ [id]: newValue });
    }

    handleRoll(e) {
        let newFrames = this.state.frames;
        let endGame = false;

        if (this.state.turn === 1) {
            let strike = this.state.roll >= 10;
            newFrames[this.state.frame - 1].strike = strike;
            newFrames[this.state.frame - 1].roll1 = this.state.roll;
            if (this.state.frame === this.maxFrames) {
                this.setupNextTurn(this.newFrame, false, 2);
            } else {
                this.setupNextTurn(newFrames, strike, strike ? 1 : 2);
            }

        } else if (this.state.turn === 2) {
            newFrames[this.state.frame - 1].spare = newFrames[this.state.frame - 1].roll1 + this.state.roll >= 10;
            newFrames[this.state.frame - 1].roll2 = Math.min(this.state.roll, 10 - (this.state.frame !== this.maxFrames ? newFrames[this.state.frame - 1].roll1 : 0));
            this.setupNextTurn(newFrames, true, this.state.frame === this.maxFrames ? 3 : 1);

        } else if (this.state.turn === 3) {
            console.log(newFrames[this.state.frame - 1].roll2);
            newFrames[this.state.frame - 1].roll3 = Math.min(this.state.roll, 10);
            newFrames[this.state.frame - 1].closed = true;
            console.log(newFrames[this.state.frame - 1].roll3);
            endGame = true;
        }

        this.updateScore();
        this.setState({ gameOver: endGame });
    }

    render() {
        return (<div className="game-container">
            {!this.state.started && <>Bowling Game - Unstarted
                <div>
             <button id="start"
              onClick={e => this.handleStart(e)}>
                Start
             </button></div></>
            }
            {this.state.started && <>Bowling Game - Frame {this.state.frame} / {this.maxFrames}
                {this.state.frame === this.maxFrames && this.state.turn === 3 && <> - Extra Shot</>}
            <div>
                <FrameList
                    data={this.state.frames}
                   />
                    {!this.state.gameOver && <>
                        <input
                            type="number"
                            id="roll"
                            value={this.state.value}
                            min="0"
                            max="10"
                            onChange={e => this.handleChange(e)}
                        />
                        <button id="roll"
                            onClick={e => this.handleRoll(e)}>
                            Roll
                        </button> </>}
                    {this.state.gameOver && <div>Game over! Final Score: {this.state.totalScore}</div>}
            </div>
            </>}
         </div>);
    }
}

export default Manager;