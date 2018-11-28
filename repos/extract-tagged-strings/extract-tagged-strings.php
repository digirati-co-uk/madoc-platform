#!/usr/bin/env php
<?php
include __DIR__ . '/../../autoload.php';

$tag = '@translate';
$excludes = ['vendor', 'modules', 'themes'];

$argv = $_SERVER['argv'];
if (isset($argv[1])) {
    $dir = $argv[1];
} else {
    $dir = getcwd();
}

$finder = new Symfony\Component\Finder\Finder;
$finder->files()->in($dir)
    ->name('*.php')
    ->name('*.phtml')
    ->ignoreDotFiles(true)
    ->ignoreVCS(true)
    ->exclude($excludes);

$strings = [];
foreach ($finder as $file) {
    $code = $file->getContents();
    $tokens = token_get_all($code);
    foreach ($tokens as $index => $token) {
        if (is_array($token) && $token[0] === T_COMMENT && strpos($token[1], $tag) !== false) {
            $backtrackIndex = $index;
            do {
                $backtrackIndex--;
                $backtrackToken = $tokens[$backtrackIndex];
                if (is_array($backtrackToken) && $backtrackToken[0] === T_CONSTANT_ENCAPSED_STRING) {
                    $strings[$backtrackToken[1]][] = [$file->getRelativePathname(), $backtrackToken[2]];
                    break;
                }
            } while ($backtrackIndex > 0);
        }
    }
}

$header = <<<'POT'
#, fuzzy
msgid ""
msgstr ""
"MIME-Version: 1.0\n"
"Content-Type: text/plain; charset=UTF-8\n"
"Content-Transfer-Encoding: 8bit\n"


POT;

$commentTemplate = "#: %s:%s\n";
$template = <<<POT
msgid "%s"
msgstr ""


POT;

$output = '';
foreach ($strings as $string => $lineInfo) {
    foreach ($lineInfo as $occurrence) {
        $output .= sprintf($commentTemplate, $occurrence[0], $occurrence[1]);
    }

    // $string is always a T_CONSTANT_ENCAPSED_STRING so we can safely eval it
    $string = eval("return $string;");

    $pattern = <<<'PATTERN'
/
    %
    ([0-9]*\$)?         # position
    [+-]?               # sign
    ([0 ]|\'.)?         # padding
    -?                  # alignment
    [0-9]*              # width
    (\..?[0-9]+)?       # precision
    [%bcdeEfFgGosuxX]   # type
/x
PATTERN;

    if (preg_match($pattern, $string)) {
        $output .= "#, php-format\n";
    }

    $output .= sprintf($template, addcslashes($string, "\n\"\\"));
}

echo $header . $output;
