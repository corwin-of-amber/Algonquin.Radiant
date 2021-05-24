fof(assume1, axiom,
    ! [S0,S] :
    (
        rrtc(S0,S) =>
        (i(S) = null | n(S, i(S)) = n(S0, i(S)))
    )
).

fof(assume1sattelite, axiom,
    ! [S,S1] :
    (
        (r(S, S1) & i(S) = null) => $false
    )
).

fof(assume2, axiom,
    ! [S0,S,U] :
    (
        rrtc(S0,S) =>
        (n(S, U) = n(S0, U) | ntc(S0, U, i(S)))
    )
).

fof(assume3, axiom,
    ! [S0,S,S1,U] :
    (
        (n(S, i(S)) = n(S0, i(S)) & ntc(S0, U, i(S)) & r(S, S1)) =>
        ntc(S0, U, i(S1))
    )
).

fof(conc, conjecture,
    ! [S0,S,S1,U] :
    (
        (rrtc(S0, S) & r(S, S1)) =>
        (n(S, U) = n(S0, U) | ntc(S0, U, i(S1)))
    )
).