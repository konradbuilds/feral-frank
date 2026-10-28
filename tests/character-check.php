<?php
require dirname(__DIR__) . '/character.php';
function ensure($condition) { if (!$condition) throw new RuntimeException('Character check failed'); }
$default = frank_character_prompt(null);
ensure(frank_character_prompt(['length'=>-1,'humour'=>99,'roughness'=>'2','opinion'=>2.5]) === $default);
foreach ([0,1,2] as $n) {
 $prompt=frank_character_prompt(['length'=>$n,'humour'=>$n,'roughness'=>$n,'opinion'=>$n,'notes'=>'UNTRUSTED_NOTE']);
 ensure(str_contains($prompt,'For consequential decisions'));
 ensure(!str_contains($prompt,'UNTRUSTED_NOTE'));
}
ensure(str_contains(frank_character_prompt(['opinion'=>2]),'Opinionated: high'));
$context=explode("\n",frank_character_context(['notes'=>str_repeat('x',900)],['note'=>str_repeat('y',9000)]),2);
$data=json_decode($context[1],true);ensure(strlen($data['styleNotes'])===600);ensure(strlen($data['memory'])===6000);
echo "PHP character validation and context separation passed.\n";
