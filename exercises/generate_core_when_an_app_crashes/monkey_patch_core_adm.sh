# This script is used to "monkey-patch" the coreadm util
# that needs to be used by students to change code dumps generation
# configuration to pass this exercise.
# It prevents students from setting an unsupported global pattern
# that would further lead to coreadm being unusable.
# It is a workaround for the following issue:
# http://smartos.org/bugview/OS-3042

CORE_ADM_BIN=`which coreadm`

is_core_adm_pattern_option () {
  if [ "$1" == "-g" ]; then return 1; fi
  if [ "$1" == "-i" ]; then return 1; fi

  return 0;
}

core_adm () {
  typeset CHECK_NEXT_PARAM=0
  for param in $@; do

    if [[ ${CHECK_NEXT_PARAM} -eq 1 ]]; then
       case ${param} in
         /*) true;;
         *) (echo "coreadm: ERELPATH" 1>&2); return 1;;
       esac
    fi

    $(is_core_adm_pattern_option ${param})
    if [[ $? -eq 1 ]]; then
      CHECK_NEXT_PARAM=1
    else
      CHECK_NEXT_PARAM=0
    fi;
  done

  ${CORE_ADM_BIN} $@
}

alias coreadm=core_adm
