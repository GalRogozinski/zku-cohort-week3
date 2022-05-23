const chai = require("chai");
const path = require("path");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);
const buildPoseidon = require("circomlibjs").buildPoseidon;


const assert = chai.assert;

describe("bonus test", function () {
    this.timeout(100000000);
    it("bonus test", async () => {
        const poseidon = await buildPoseidon();
        const F = poseidon.F;
        const circuit = await wasm_tester("contracts/circuits/bonus.circom");
        await circuit.loadConstraints();
        const stealthPlayerSecret = 51221124124 //good enough for test
        //there is an off circuit merkle tree that ensures we can't use random hashes like we do here
        const stealthPlayerCardHash = 256; // good enough for test
        const stealthPlayerCard = stealthPlayerCardHash % 13;
        const mulBy13 = Math.floor(stealthPlayerCardHash / 13);

        const stealthPlayerCardHashCommitment = poseidon([stealthPlayerCardHash, stealthPlayerSecret])
        
        console.log("stealth player card %d", stealthPlayerCard);
        console.log("stealth player card hash %d", stealthPlayerCardHash);
        console.log("MulBy13 %d", mulBy13);
        console.log("stealth player card hash commitment %s", stealthPlayerCardHashCommitment);



        const INPUT = {
            "openPlayerCard": 8, //stealth player is 9. So 8 is the largest open card we can have
            "stealthPlayerCardHashCommitment": F.toObject(stealthPlayerCardHashCommitment),
            "stealthPlayerCard": stealthPlayerCard,
            "stealthPlayerCardHash": stealthPlayerCardHash,
            "stealthPlayerSecret": stealthPlayerSecret,
            "mulBy13": mulBy13,
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        // asserts that the circuit output is as expected.
        await circuit.assertOut(witness, {stealthPlayerWins : 1});
        // double check. This will be better suited if we would've generated a malicious wintess.
        await circuit.checkConstraints(witness)
    });
});