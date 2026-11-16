#include "Characters/CharacterStatsComponent.h"
#include "Kismet/KismetMathLibrary.h"
#include "Kismet/KismetSystemLibrary.h"
#include "Interfaces/Fighter.h"

UCharacterStatsComponent::UCharacterStatsComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

void UCharacterStatsComponent::BeginPlay()
{
    Super::BeginPlay();
}

void UCharacterStatsComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);
}

void UCharacterStatsComponent::ReduceHealth(float Amount, AActor* Opponent)
{
    if (Stats[EStat::Health] <= 0) return;

    IFighter* FighterRef = GetOwner<IFighter>();
    if (!FighterRef->CanTakeDamage(Opponent)) return;

    Stats[EStat::Health] -= Amount;
    Stats[EStat::Health] = UKismetMathLibrary::FClamp(
        Stats[EStat::Health],
        0,
        Stats[EStat::MaxHealth]
    );

    OnHealthPercentUpdateDelegate.Broadcast(
        GetStatPercentage(EStat::Health, EStat::MaxHealth)
    );

    if (Stats[EStat::Health] == 0)
        OnZeroHealthDelegate.Broadcast();
}

void UCharacterStatsComponent::ReduceStamina(float Amount)
{
    Stats[EStat::Stamina] -= Amount;
    Stats[EStat::Stamina] = UKismetMathLibrary::FClamp(
        Stats[EStat::Stamina],
        0,
        Stats[EStat::MaxStamina]
    );

    bCanRegen = false;

    FLatentActionInfo FunctionInfo{ 0, 100, TEXT("EnableRegen"), this };
    UKismetSystemLibrary::RetriggerableDelay(
        GetWorld(),
        StaminaDelayDuration,
        FunctionInfo
    );

    OnStaminaPercentUpdateDelegate.Broadcast(
        GetStatPercentage(EStat::Stamina, EStat::MaxStamina)
    );
}

void UCharacterStatsComponent::RegenStamina()
{
    if (!bCanRegen) return;

    Stats[EStat::Stamina] = UKismetMathLibrary::FInterpTo_Constant(
        Stats[EStat::Stamina],
        Stats[EStat::MaxStamina],
        GetWorld()->DeltaRealTimeSeconds,
        StaminaRegenState
    );

    OnStaminaPercentUpdateDelegate.Broadcast(
        GetStatPercentage(EStat::Stamina, EStat::MaxStamina)
    );
}

void UCharacterStatsComponent::EnableRegen()
{
    bCanRegen = true;
}

float UCharacterStatsComponent::GetStatPercentage(EStat Current, EStat Max)
{
    return Stats[Current] / Stats[Max];
}
