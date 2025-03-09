// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserRegistry {
    struct User {
        string userType;
        bool registered;
    }

    mapping(address => User) public users;
    event UserRegistered(address indexed user, string userType);

    function registerUser(string memory _userType) public {
        require(!users[msg.sender].registered, "User already registered");
        require(
            keccak256(abi.encodePacked(_userType)) == keccak256("patient") ||
                keccak256(abi.encodePacked(_userType)) == keccak256("doctor") ||
                keccak256(abi.encodePacked(_userType)) == keccak256("hospital"),
            "Invalid user type"
        );

        users[msg.sender] = User({
            userType: _userType,
            registered: true
        });
        emit UserRegistered(msg.sender, _userType);
    }

    function isRegistered(address _user) external view returns (bool) {
        return users[_user].registered;
    }

    function getUserType(address _user) external view returns (string memory) {
        return users[_user].userType;
    }

    function isDoctor(address _user) external view returns (bool) {
        return
            keccak256(abi.encodePacked(users[_user].userType)) ==
            keccak256("doctor");
    }
}
