/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/befundr.json`.
 */
export type Befundr = {
  "address": "GwhXp6uzcsDPb8Git18t1pKAqE7zb9Jmviay6ffBdXfk",
  "metadata": {
    "name": "befundr",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addContribution",
      "discriminator": [
        115,
        15,
        193,
        201,
        25,
        254,
        227,
        124
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true,
          "relations": [
            "projectContributions",
            "reward"
          ]
        },
        {
          "name": "projectContributions",
          "writable": true
        },
        {
          "name": "reward",
          "writable": true,
          "optional": true
        },
        {
          "name": "user"
        },
        {
          "name": "userContributions",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "contribution",
          "writable": true
        },
        {
          "name": "fromAta",
          "writable": true
        },
        {
          "name": "toAta",
          "writable": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelContribution",
      "discriminator": [
        184,
        238,
        88,
        63,
        152,
        103,
        17,
        123
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true,
          "relations": [
            "reward"
          ]
        },
        {
          "name": "user"
        },
        {
          "name": "contribution",
          "writable": true
        },
        {
          "name": "reward",
          "writable": true,
          "optional": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "claimUnlockRequest",
      "discriminator": [
        136,
        165,
        18,
        154,
        15,
        250,
        197,
        220
      ],
      "accounts": [
        {
          "name": "user",
          "relations": [
            "project"
          ]
        },
        {
          "name": "unlockRequests",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  117,
                  110,
                  108,
                  111,
                  99,
                  107,
                  95,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "project"
              }
            ]
          }
        },
        {
          "name": "currentUnlockRequest",
          "writable": true
        },
        {
          "name": "fromAta",
          "writable": true
        },
        {
          "name": "toAta",
          "writable": true
        },
        {
          "name": "project",
          "relations": [
            "unlockRequests",
            "currentUnlockRequest"
          ]
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "user"
          ]
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "createdProjectCounter",
          "type": "u16"
        }
      ]
    },
    {
      "name": "completeTransaction",
      "discriminator": [
        34,
        152,
        198,
        211,
        120,
        165,
        66,
        161
      ],
      "accounts": [
        {
          "name": "historyTransactions",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  104,
                  105,
                  115,
                  116,
                  111,
                  114,
                  121,
                  95,
                  116,
                  114,
                  97,
                  110,
                  115,
                  97,
                  99,
                  116,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "contribution"
              }
            ]
          }
        },
        {
          "name": "saleTransaction",
          "writable": true
        },
        {
          "name": "projectSaleTransactions",
          "writable": true
        },
        {
          "name": "buyerUserContributions",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "buyerUser"
              }
            ]
          }
        },
        {
          "name": "sellerUserContributions",
          "writable": true
        },
        {
          "name": "buyerUser"
        },
        {
          "name": "sellerUser"
        },
        {
          "name": "contribution",
          "writable": true,
          "relations": [
            "saleTransaction"
          ]
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "buyerAta",
          "writable": true
        },
        {
          "name": "seller",
          "writable": true
        },
        {
          "name": "sellerAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createProject",
      "discriminator": [
        148,
        219,
        181,
        42,
        221,
        114,
        145,
        190
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "rewards",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  114,
                  101,
                  119,
                  97,
                  114,
                  100,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "project"
              }
            ]
          }
        },
        {
          "name": "projectSaleTransactions",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  115,
                  97,
                  108,
                  101,
                  95,
                  116,
                  114,
                  97,
                  110,
                  115,
                  97,
                  99,
                  116,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "project"
              }
            ]
          }
        },
        {
          "name": "projectContributions",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  105,
                  111,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "project"
              }
            ]
          }
        },
        {
          "name": "unlockRequests",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  117,
                  110,
                  108,
                  111,
                  99,
                  107,
                  95,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "project"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "fromAta",
          "writable": true
        },
        {
          "name": "toAta",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "goalAmount",
          "type": "u64"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "safetyDeposit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createReward",
      "discriminator": [
        55,
        169,
        173,
        212,
        11,
        55,
        47,
        130
      ],
      "accounts": [
        {
          "name": "project",
          "writable": true,
          "relations": [
            "rewards"
          ]
        },
        {
          "name": "reward",
          "writable": true
        },
        {
          "name": "rewards",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "relations": [
            "project"
          ]
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "user"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "metadataUri",
          "type": "string"
        },
        {
          "name": "maxSupply",
          "type": {
            "option": "u16"
          }
        },
        {
          "name": "price",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createTransaction",
      "discriminator": [
        227,
        193,
        53,
        239,
        55,
        126,
        112,
        105
      ],
      "accounts": [
        {
          "name": "saleTransaction",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  97,
                  108,
                  101,
                  95,
                  116,
                  114,
                  97,
                  110,
                  115,
                  97,
                  99,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "contribution"
              }
            ]
          }
        },
        {
          "name": "projectSaleTransactions",
          "writable": true
        },
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "contribution"
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "user"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "sellingPrice",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createUnlockRequest",
      "discriminator": [
        134,
        176,
        114,
        229,
        42,
        195,
        78,
        214
      ],
      "accounts": [
        {
          "name": "user",
          "relations": [
            "project"
          ]
        },
        {
          "name": "unlockRequests",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  117,
                  110,
                  108,
                  111,
                  99,
                  107,
                  95,
                  114,
                  101,
                  113,
                  117,
                  101,
                  115,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "project"
              }
            ]
          }
        },
        {
          "name": "newUnlockRequest",
          "writable": true
        },
        {
          "name": "currentUnlockRequest",
          "optional": true
        },
        {
          "name": "project",
          "relations": [
            "unlockRequests",
            "currentUnlockRequest"
          ]
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "user"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amountRequested",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createUser",
      "discriminator": [
        108,
        227,
        130,
        130,
        252,
        109,
        75,
        218
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "deleteUser",
      "discriminator": [
        186,
        85,
        17,
        249,
        219,
        231,
        98,
        251
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "contribution",
      "discriminator": [
        182,
        187,
        14,
        111,
        72,
        167,
        242,
        212
      ]
    },
    {
      "name": "historyTransactions",
      "discriminator": [
        184,
        17,
        28,
        110,
        11,
        241,
        1,
        42
      ]
    },
    {
      "name": "project",
      "discriminator": [
        205,
        168,
        189,
        202,
        181,
        247,
        142,
        19
      ]
    },
    {
      "name": "projectContributions",
      "discriminator": [
        83,
        72,
        156,
        71,
        194,
        187,
        160,
        150
      ]
    },
    {
      "name": "projectSaleTransactions",
      "discriminator": [
        220,
        186,
        205,
        79,
        189,
        231,
        72,
        3
      ]
    },
    {
      "name": "reward",
      "discriminator": [
        174,
        129,
        42,
        212,
        190,
        18,
        45,
        34
      ]
    },
    {
      "name": "rewards",
      "discriminator": [
        12,
        223,
        68,
        101,
        63,
        33,
        38,
        101
      ]
    },
    {
      "name": "saleTransaction",
      "discriminator": [
        104,
        200,
        226,
        139,
        191,
        134,
        207,
        37
      ]
    },
    {
      "name": "unlockRequest",
      "discriminator": [
        35,
        145,
        59,
        13,
        207,
        180,
        49,
        24
      ]
    },
    {
      "name": "unlockRequests",
      "discriminator": [
        225,
        75,
        162,
        136,
        240,
        196,
        185,
        219
      ]
    },
    {
      "name": "user",
      "discriminator": [
        159,
        117,
        95,
        227,
        239,
        151,
        58,
        236
      ]
    },
    {
      "name": "userContributions",
      "discriminator": [
        215,
        150,
        11,
        243,
        145,
        49,
        43,
        66
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "contributionNotFound",
      "msg": "Contribution not found"
    }
  ],
  "types": [
    {
      "name": "contribution",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialOwner",
            "type": "pubkey"
          },
          {
            "name": "currentOwner",
            "type": "pubkey"
          },
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "creationTimestamp",
            "type": "i64"
          },
          {
            "name": "isClaimed",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "contributionStatus"
              }
            }
          },
          {
            "name": "reward",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "contributionStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "historyTransaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "contribution",
            "type": "pubkey"
          },
          {
            "name": "sellingPrice",
            "type": "u64"
          },
          {
            "name": "creationTimestamp",
            "type": "i64"
          },
          {
            "name": "saleTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "historyTransactions",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "transactions",
            "type": {
              "vec": {
                "defined": {
                  "name": "historyTransaction"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "project",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "goalAmount",
            "type": "u64"
          },
          {
            "name": "raisedAmount",
            "type": "u64"
          },
          {
            "name": "createdTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "projectStatus"
              }
            }
          },
          {
            "name": "contributionCounter",
            "type": "u16"
          },
          {
            "name": "safetyDeposit",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "projectContributions",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "contributions",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "projectSaleTransactions",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "saleTransactions",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "projectStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "draft"
          },
          {
            "name": "fundraising"
          },
          {
            "name": "realising"
          },
          {
            "name": "completed"
          },
          {
            "name": "abandoned"
          },
          {
            "name": "suspended"
          }
        ]
      }
    },
    {
      "name": "reward",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "maxSupply",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "currentSupply",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "rewards",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "rewardCounter",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "saleTransaction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "contribution",
            "type": "pubkey"
          },
          {
            "name": "contributionAmount",
            "type": "u64"
          },
          {
            "name": "sellingPrice",
            "type": "u64"
          },
          {
            "name": "creationTimestamp",
            "type": "i64"
          },
          {
            "name": "rewardId",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "unlockRequest",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "amountRequested",
            "type": "u64"
          },
          {
            "name": "votesAgainst",
            "type": "u64"
          },
          {
            "name": "createdTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "unlockTime",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "unlockStatus"
              }
            }
          },
          {
            "name": "isClaimed",
            "type": "bool"
          },
          {
            "name": "votes",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "unlockRequests",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "requestCounter",
            "type": "u16"
          },
          {
            "name": "unlockedAmount",
            "type": "u64"
          },
          {
            "name": "requests",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "unlockStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "approved"
          },
          {
            "name": "rejected"
          }
        ]
      }
    },
    {
      "name": "user",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "createdProjectCounter",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "userContributions",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "contributions",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    }
  ]
};
