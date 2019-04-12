#!/usr/bin/env bash

bin/madoc generate-language

git diff --exit-code || (
  echo "ERROR: Translations check failed, see differences above."
  echo "To fix, run bin/madoc generate-language before submitting a pull request."
  false
)
