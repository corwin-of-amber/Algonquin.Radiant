% from core2
fof(assume1, axiom,
    ! [S0,S,S1,U] :
    (
        (rrtc(S0, S) & r(S, S1)) =>
        (n(S, U) = n(S0, U) | ntc(S0, U, i(S1)))
    )
).

% from core3
fof(assume2, axiom,
    ! [S0,S,S1,U] :
    (
        (rrtc(S0, S) & r(S, S1)) =>
        (n(S1, U) = n(S, U) | ntc(S0, U, i(S1)))
    )
).

fof(conc, conjecture,
    ! [S0,S,S1,U] :
    (
        (rrtc(S0, S) & r(S, S1)) =>
        (n(S1, U) = n(S0, U) | ntc(S0, U, i(S1)))
    )
).