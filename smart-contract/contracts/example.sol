// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Example {
    function function1(
        uint16 param1,
        uint16 param2
    ) public pure returns (uint32) {
        return uint32(param1) + uint32(param2);
    }

    function function2(uint32 input) public pure returns (uint64) {
        return uint64(input) * 2;
    }
}
