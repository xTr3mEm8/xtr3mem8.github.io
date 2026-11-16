#include "Components/InteractionComponent.h"
#include "Interfaces/ObjectInterface.h"
#include "GameFramework/Actor.h"
#include "Engine/World.h"
#include "DrawDebugHelpers.h"

UInteractionComponent::UInteractionComponent()
{
    PrimaryComponentTick.bCanEverTick = true;
}

void UInteractionComponent::BeginPlay()
{
    Super::BeginPlay();
}

void UInteractionComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
    Super::TickComponent(DeltaTime, TickType, ThisTickFunction);
}

void UInteractionComponent::Interact()
{
    AActor* InteractableActor = GetInteractableActor();
    if (InteractableActor && InteractableActor->Implements<UObjectInterface>())
    {
        IObjectInterface* Interface = Cast<IObjectInterface>(InteractableActor);
        if (Interface)
        {
            Interface->Interact();
        }
    }
}

AActor* UInteractionComponent::GetInteractableActor() const
{
    AActor* Owner = GetOwner();
    if (!Owner) return nullptr;

    FVector Start;
    FRotator CameraRotation;
    GetOwner()->GetActorEyesViewPoint(Start, CameraRotation);
    FVector End = Start + (CameraRotation.Vector() * InteractionDistance);

    FHitResult HitResult;
    FCollisionQueryParams Params;
    Params.AddIgnoredActor(GetOwner());

    if (DrawLine)
    {
        DrawDebugLine(GetWorld(), Start, End, FColor::Red, false, 2000.0f);
    }

    if (GetWorld()->LineTraceSingleByChannel(HitResult, Start, End, ECC_Visibility, Params))
    {
        if (HitResult.GetActor() && HitResult.GetActor()->Implements<UObjectInterface>())
        {
            return HitResult.GetActor();
        }
    }

    return nullptr;
}
