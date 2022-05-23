const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);
const buildPoseidon = require("circomlibjs").buildPoseidon;


const assert = chai.assert;

describe("Mastermind test", function () {
    this.timeout(100000000);
    it("mastermind variation", async () => {
        const poseidon = await buildPoseidon();
        const F = poseidon.F;
        const circuit = await wasm_tester("contracts/circuits/MasterMindVariation.circom");
        await circuit.loadConstraints();

        const pubSolnHash = poseidon([1, 6, 9, 7]);
        const INPUT = {
            "pubGuessA": 6,
            "pubGuessB": 7,
            "pubGuessC": 8,
            "redPegs": 1,
            "whitePegs": 1,
            "pubSolnHash": F.toObject(pubSolnHash),
            "privSolnA": 6,
            "privSolnB": 9,
            "privSolnC": 7,
            "privSalt": 1,
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        // asserts that the circuit output is as expected.
        await circuit.assertOut(witness, {solnHashOut : F.toObject(pubSolnHash)});
        // double check. This will be better suited if we would've generated a malicious wintess.
        await circuit.checkConstraints(witness)
    });
});